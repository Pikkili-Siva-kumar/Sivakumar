import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../services/api';
import './SearchModal.css';

const TYPE_CONFIG = {
  project: { label: 'Project', badgeClass: 'search-badge--project', groupName: 'Projects' },
  service: { label: 'Service', badgeClass: 'search-badge--service', groupName: 'Services' },
  blog: { label: 'Article', badgeClass: 'search-badge--blog', groupName: 'Articles' },
  page: { label: 'Page', badgeClass: 'search-badge--page', groupName: 'Pages' },
  skill: { label: 'Skill', badgeClass: 'search-badge--skill', groupName: 'Skills' },
};

const ORDERED_TYPES = ['project', 'service', 'blog', 'page', 'skill'];

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const resultsRef = useRef(null);

  // Reset search term when modal opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSearchTerm('');
      setResults([]);
      setIsLoading(false);
      setHasError(false);
      setSelectedIndex(0);
    }
  }

  // Auto-focus input when modal opens & handle body overflow
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setHasError(false);
      setSelectedIndex(0);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setIsLoading(false);
    setHasError(false);
    setSelectedIndex(0);
    if (inputRef.current) inputRef.current.focus();
  };

  // Debounced search query for terms >= 2 chars (250ms preserved)
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed.length < 2) {
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      setHasError(false);
      searchApi
        .search(trimmed)
        .then((res) => {
          if (res && res.results) {
            setResults(res.results);
            setSelectedIndex(0);
          } else {
            setResults([]);
          }
        })
        .catch(() => {
          setHasError(true);
          setResults([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups = {};
    for (const type of ORDERED_TYPES) {
      groups[type] = [];
    }
    for (const item of results) {
      const type = item.type || 'page';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
    }
    return groups;
  }, [results]);

  // Flattened results list for keyboard navigation
  const flatResults = useMemo(() => {
    const list = [];
    for (const type of ORDERED_TYPES) {
      if (groupedResults[type] && groupedResults[type].length > 0) {
        list.push(...groupedResults[type]);
      }
    }
    return list;
  }, [groupedResults]);

  const handleSelect = useCallback(
    (item) => {
      if (!item || !item.url) return;
      onClose();
      navigate(item.url);
    },
    [navigate, onClose]
  );

  // Keyboard navigation: Arrow keys & Enter & Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (flatResults.length > 0 ? (prev + 1) % flatResults.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          flatResults.length > 0 ? (prev - 1 + flatResults.length) % flatResults.length : 0
        );
      } else if (e.key === 'Enter') {
        if (flatResults.length > 0 && flatResults[selectedIndex]) {
          e.preventDefault();
          handleSelect(flatResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, flatResults, selectedIndex, handleSelect]);

  if (!isOpen) return null;

  const trimmedQuery = searchTerm.trim();
  const showInitialEmpty = trimmedQuery.length === 0;
  const showShortQuery = trimmedQuery.length === 1;
  const showNoResults = trimmedQuery.length >= 2 && results.length === 0 && !isLoading && !hasError;

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Site Search"
      onClick={onClose}
    >
      <div
        className="search-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar - Text-first, no icons, no badges */}
        <div className="search-modal__bar">
          <input
            ref={inputRef}
            type="search"
            className="search-modal__input"
            placeholder="Search projects, services, skills..."
            value={searchTerm}
            onChange={handleInputChange}
            aria-label="Search query"
            autoComplete="off"
            spellCheck="false"
          />

          {searchTerm && (
            <button
              type="button"
              className="search-modal__clear-btn"
              onClick={handleClear}
              aria-label="Clear search input"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            className="search-modal__close-btn"
            onClick={onClose}
            aria-label="Close search"
          >
            &times;
          </button>
        </div>

        {/* Results / Empty States viewport */}
        <div className="search-modal__results-area" ref={resultsRef}>
          {hasError && (
            <div className="search-modal__empty-state" role="alert">
              <p className="search-modal__empty-title">Search is temporarily unavailable.</p>
              <p className="search-modal__empty-desc">Please try again in a few moments.</p>
            </div>
          )}

          {showInitialEmpty && (
            <div className="search-modal__empty-state">
              <p className="search-modal__empty-desc">Search projects, services, skills, and articles.</p>
            </div>
          )}

          {showShortQuery && (
            <div className="search-modal__empty-state">
              <p className="search-modal__empty-desc">Type at least 2 characters.</p>
            </div>
          )}

          {showNoResults && (
            <div className="search-modal__empty-state">
              <p className="search-modal__empty-title">No results found.</p>
              <p className="search-modal__empty-desc">Try a different search term.</p>
            </div>
          )}

          {isLoading && flatResults.length === 0 && (
            <div className="search-modal__empty-state">
              <p className="search-modal__empty-desc">Searching...</p>
            </div>
          )}

          {!hasError && flatResults.length > 0 && (
            <>
              {ORDERED_TYPES.map((type) => {
                const items = groupedResults[type] || [];
                if (items.length === 0) return null;
                const config = TYPE_CONFIG[type] || {
                  label: type,
                  badgeClass: 'search-badge--page',
                  groupName: type,
                };

                return (
                  <div key={type} className="search-group">
                    <div className="search-group__header font-mono">
                      {config.groupName}
                    </div>
                    <div className="search-group__list">
                      {items.map((item) => {
                        const itemIdx = flatResults.indexOf(item);
                        const isFocused = itemIdx === selectedIndex;

                        return (
                          <div
                            key={`${type}-${item.url}-${item.title}`}
                            className={`search-result-item ${isFocused ? 'search-result-item--focused' : ''}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(itemIdx)}
                          >
                            <div className="search-result-item__content">
                              <div className="search-result-item__top">
                                <span className="search-result-item__title">{item.title}</span>
                                <span className={`search-result-item__badge ${config.badgeClass}`}>
                                  {config.label}
                                </span>
                              </div>
                              {item.description && (
                                <p className="search-result-item__desc">{item.description}</p>
                              )}
                            </div>
                            <span className="search-result-item__arrow" aria-hidden="true">&rarr;</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
