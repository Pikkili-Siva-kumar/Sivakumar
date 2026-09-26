import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import WorkflowProgress from './WorkflowProgress';
import {
  FL_DEMO_DATASETS,
  FL_DEMO_MODELS,
  FL_PIPELINE_STAGES,
} from '../../data/playground';

/**
 * FederatedLearningPlayground Component
 * Step 30: Interactive Multi-Stage Federated Learning Pipeline Demo
 *
 * Demonstrates deterministic workflow stages (Validation -> Training -> Updates -> Aggregation -> Prediction)
 * in the browser without claiming fake accuracy numbers or production execution.
 */
export default function FederatedLearningPlayground() {
  const [selectedDataset, setSelectedDataset] = useState('valid');
  const [selectedModel, setSelectedModel] = useState('XGBoost');
  const [rounds, setRounds] = useState(3);

  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [isFailed, setIsFailed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [logs, setLogs] = useState([]);

  const timerRef = useRef(null);

  // Clear running timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleRunSimulation = () => {
    // Reset state before starting
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSimulating(true);
    setIsFailed(false);
    setIsComplete(false);
    setCurrentStageIndex(0);
    setLogs([`Initiating pipeline with model: ${selectedModel} (${rounds} round(s))...`]);

    const datasetInfo = FL_DEMO_DATASETS.find((d) => d.id === selectedDataset);

    // If dataset is invalid, fail at stage 0 (Validation)
    if (!datasetInfo.isValid) {
      timerRef.current = setTimeout(() => {
        setIsSimulating(false);
        setIsFailed(true);
        setIsComplete(false);
        setLogs((prev) => [
          ...prev,
          'Validating schema headers and numeric distributions...',
          'CRITICAL: Missing required feature headers and malformed row vectors detected in payload.',
          'Dataset validation failed. Training was not started.',
        ]);
      }, 450);
      return;
    }

    // Step-by-step valid execution
    timerRef.current = setTimeout(() => {
      // Stage 0: Validation Passed
      setCurrentStageIndex(1);
      setLogs((prev) => [
        ...prev,
        'Stage 1: Dataset schema verified. Feature shape: [1000, 14].',
        `Stage 2: Commencing local training with ${selectedModel} across ${rounds} round(s)...`,
      ]);

      timerRef.current = setTimeout(() => {
        // Stage 1: Local Training Completed
        setCurrentStageIndex(2);
        setLogs((prev) => [
          ...prev,
          `Local training completed successfully across ${rounds} round(s).`,
          'Stage 3: Extracting local parameter updates and gradient deltas...',
        ]);

        timerRef.current = setTimeout(() => {
          // Stage 2: Model Updates Extracted
          setCurrentStageIndex(3);
          setLogs((prev) => [
            ...prev,
            'Local parameter updates extracted without exposing raw data records.',
            'Stage 4: Transmitting updates to coordinator for federated averaging...',
          ]);

          timerRef.current = setTimeout(() => {
            // Stage 3: Aggregation Completed
            setCurrentStageIndex(4);
            setLogs((prev) => [
              ...prev,
              'Global aggregation completed: coordinate weights synchronized.',
              'Stage 5: Compiling global model representation for inference serving...',
            ]);

            timerRef.current = setTimeout(() => {
              // Stage 4: Prediction Ready
              setIsSimulating(false);
              setIsComplete(true);
              setLogs((prev) => [
                ...prev,
                'Prediction pipeline ready. Model exported for real-time inference.',
              ]);
            }, 400);
          }, 400);
        }, 400);
      }, 450);
    }, 450);
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSimulating(false);
    setCurrentStageIndex(-1);
    setIsFailed(false);
    setIsComplete(false);
    setLogs([]);
    setSelectedDataset('valid');
    setSelectedModel('XGBoost');
    setRounds(3);
  };

  return (
    <div className="fl-playground" role="region" aria-label="Federated Learning Interactive Playground">
      <div className="playground-panel">
        {/* Panel Header */}
        <div className="playground-panel__header">
          <div className="playground-panel__badge badge font-mono">
            <span className="playground-panel__badge-dot" aria-hidden="true" />
            <span>INTERACTIVE DEMONSTRATION</span>
          </div>
          <h2 className="playground-panel__title">Federated Learning Demo</h2>
          <p className="playground-panel__desc">
            Demonstrate the high-level workflow of Dataset → Validation → Local Training → Model Updates → Global Aggregation → Prediction.
          </p>
        </div>

        {/* Pipeline Visualizer */}
        <div className="fl-playground__progress-wrap">
          <WorkflowProgress
            stages={FL_PIPELINE_STAGES}
            activeStageIndex={currentStageIndex}
            isFailed={isFailed}
            isComplete={isComplete}
          />
        </div>

        {/* Controls & Log Output Grid */}
        <div className="fl-playground__grid">
          {/* Controls Column */}
          <div className="fl-playground__controls">
            {/* Dataset Selector */}
            <div className="playground-field">
              <label htmlFor="fl-dataset-select" className="playground-field__label font-mono">
                DATASET INPUT
              </label>
              <div className="fl-radio-group" role="radiogroup" aria-label="Dataset Selection">
                {FL_DEMO_DATASETS.map((d) => {
                  const isChecked = selectedDataset === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      disabled={isSimulating}
                      className={`fl-radio-btn ${isChecked ? 'fl-radio-btn--active' : ''}`}
                      onClick={() => setSelectedDataset(d.id)}
                    >
                      <span className="fl-radio-btn__title">{d.label}</span>
                      <span className="fl-radio-btn__desc">{d.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model Selector */}
            <div className="playground-field">
              <label htmlFor="fl-model-select" className="playground-field__label font-mono">
                MODEL ARCHITECTURE
              </label>
              <div className="fl-model-pills" role="radiogroup" aria-label="Model Architecture">
                {FL_DEMO_MODELS.map((m) => {
                  const isChecked = selectedModel === m.name;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      disabled={isSimulating}
                      className={`fl-model-pill ${isChecked ? 'fl-model-pill--active' : ''}`}
                      onClick={() => setSelectedModel(m.name)}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Training Rounds */}
            <div className="playground-field">
              <label htmlFor="fl-rounds-select" className="playground-field__label font-mono">
                TRAINING ROUNDS
              </label>
              <div className="fl-rounds-pills" role="radiogroup" aria-label="Training Rounds">
                {[1, 2, 3].map((r) => {
                  const isChecked = rounds === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      disabled={isSimulating}
                      className={`fl-rounds-pill font-mono ${isChecked ? 'fl-rounds-pill--active' : ''}`}
                      onClick={() => setRounds(r)}
                    >
                      {r} {r === 1 ? 'Round' : 'Rounds'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Run Button */}
            <div className="fl-playground__run-wrap">
              <button
                type="button"
                className="playground-btn playground-btn--primary"
                onClick={handleRunSimulation}
                disabled={isSimulating}
              >
                {isSimulating ? 'Simulating Pipeline...' : 'Run Simulation'}
              </button>
              <button
                type="button"
                className="playground-btn playground-btn--secondary"
                onClick={handleReset}
                disabled={isSimulating}
              >
                Reset Simulation
              </button>
            </div>
          </div>

          {/* Right Column: Execution Output Console */}
          <div className="fl-playground__output">
            <div className="fl-console" aria-live="polite" role="region" aria-label="Simulation Execution Logs">
              <div className="fl-console__header">
                <span className="fl-console__title font-mono">PIPELINE MONITOR</span>
                <span className="fl-console__status font-mono">
                  {isSimulating ? 'RUNNING' : isFailed ? 'FAILED' : isComplete ? 'COMPLETED' : 'IDLE'}
                </span>
              </div>

              <div className="fl-console__body font-mono">
                {logs.length === 0 ? (
                  <p className="fl-console__placeholder">
                    Select a dataset, model, and training rounds, then click "Run Simulation" to execute the local pipeline.
                  </p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log}
                      className={`fl-console__line ${
                        log.includes('CRITICAL') || log.includes('failed')
                          ? 'fl-console__line--error'
                          : log.includes('ready') || log.includes('completed successfully')
                          ? 'fl-console__line--success'
                          : ''
                      }`}
                    >
                      <span className="fl-console__prompt" aria-hidden="true">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Summary Outcome Box */}
              {(isComplete || isFailed) && (
                <div
                  className={`fl-summary-box ${
                    isFailed ? 'fl-summary-box--failed' : 'fl-summary-box--success'
                  }`}
                >
                  <div className="fl-summary-box__top">
                    <span className="fl-summary-box__badge font-mono">
                      {isFailed ? 'EXECUTION HALTED' : 'WORKFLOW SUCCESS'}
                    </span>
                  </div>
                  {isFailed ? (
                    <p className="fl-summary-box__text">
                      <strong>Dataset validation failed. Training was not started.</strong>
                    </p>
                  ) : (
                    <div className="fl-summary-box__content">
                      <div className="fl-summary-box__meta font-mono">
                        <span>Dataset: <strong>Validated</strong></span> •{' '}
                        <span>Model: <strong>{selectedModel}</strong></span> •{' '}
                        <span>Rounds: <strong>{rounds}</strong></span>
                      </div>
                      <p className="fl-summary-box__text">
                        Dataset validated → Local training completed → Model update generated → Global aggregation completed → Prediction ready.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Link to Full Project */}
            <div className="fl-playground__project-link-wrap">
              <Link
                to="/work/federated-learning-6g"
                className="playground-btn playground-btn--link"
              >
                <span>View Full Project</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
