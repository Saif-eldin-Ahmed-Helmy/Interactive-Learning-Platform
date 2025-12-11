import React, { useState } from "react";
import { toast } from "react-toastify";

interface CodeExercise {
  starterCode: string;
  hints: string[];
  expectedOutput: string;
  testCases: Array<{ input: string; expectedOutput: string }>;
}

interface CodeEditorProps {
  exercise: CodeExercise;
  onComplete: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ exercise, onComplete }) => {
  const [code, setCode] = useState(exercise.starterCode);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<Array<{passed: boolean, message: string}>>([]);
  const [showTestResults, setShowTestResults] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleRunCode = () => {
    try {
      setShowTestResults(false);
      setValidationStatus('idle');
      
      // Create an iframe to run the HTML/CSS/JS code safely
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(code);
        iframeDoc.close();

        // Get the full content for validation (including head for CSS)
        const fullContent = iframeDoc.documentElement.outerHTML;
        setOutput(fullContent);

        toast.success("Code executed successfully! 🚀");
      }

      document.body.removeChild(iframe);
    } catch (error) {
      toast.error("Error running code: " + (error as Error).message);
      setValidationStatus('error');
    }
  };

  const validateCode = () => {
    const results: Array<{passed: boolean, message: string}> = [];
    
    // Run test cases if available
    if (exercise.testCases && exercise.testCases.length > 0) {
      exercise.testCases.forEach((testCase, index) => {
        try {
          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          document.body.appendChild(iframe);

          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(code);
            iframeDoc.close();

            const fullContent = iframeDoc.documentElement.outerHTML;
            const passed = fullContent.includes(testCase.expectedOutput);
            
            results.push({
              passed,
              message: passed 
                ? `✓ Test ${index + 1} passed` 
                : `✗ Test ${index + 1} failed: Expected "${testCase.expectedOutput}"`
            });
          }

          document.body.removeChild(iframe);
        } catch (error) {
          results.push({
            passed: false,
            message: `✗ Test ${index + 1} error: ${(error as Error).message}`
          });
        }
      });
    } else {
      // Simple validation - check if expected output is in the rendered content
      const passed = output.includes(exercise.expectedOutput);
      results.push({
        passed,
        message: passed 
          ? `✓ Output matches expected result` 
          : `✗ Output doesn't match: Expected "${exercise.expectedOutput}"`
      });
    }

    setTestResults(results);
    setShowTestResults(true);
    
    const allPassed = results.every(r => r.passed);
    setValidationStatus(allPassed ? 'success' : 'error');
    
    return allPassed;
  };

  const handleShowHint = () => {
    if (!showHints) {
      setShowHints(true);
      setCurrentHintIndex(0);
      toast.info(`💡 Hint revealed!`);
    } else if (currentHintIndex < exercise.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
      toast.info(`💡 Next hint revealed!`);
    } else {
      toast.info("No more hints available! You've got this! 💪");
    }
  };

  const handleSubmit = () => {
    // First run the code to get output
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(code);
        iframeDoc.close();

        const fullContent = iframeDoc.documentElement.outerHTML;
        setOutput(fullContent);
      }

      document.body.removeChild(iframe);
    } catch (error) {
      toast.error("Error running code: " + (error as Error).message);
      setValidationStatus('error');
      return;
    }

    // Validate the code
    const passed = validateCode();
    
    if (passed) {
      toast.success("🎉 Perfect! Exercise completed! +20 points!");
      setValidationStatus('success');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      toast.error("❌ Not quite right yet. Check the feedback and hints!");
      setValidationStatus('error');
      
      // Auto-show hints if validation fails
      if (!showHints && exercise.hints.length > 0) {
        setTimeout(() => {
          setShowHints(true);
          setCurrentHintIndex(0);
          toast.info("💡 Here's a hint to help you!");
        }, 1000);
      }
    }
  };

  const handleReset = () => {
    setCode(exercise.starterCode);
    setOutput("");
    setShowHints(false);
    setCurrentHintIndex(0);
    setTestResults([]);
    setShowTestResults(false);
    setValidationStatus('idle');
    toast.info("Code reset to starter template");
  };

  return (
    <div className="code-editor-wrapper">
      <div className="code-editor-header">
        <h5 className="fw-bold">💻 Code Challenge</h5>
        <div className="header-actions">
          <button className="btn btn-sm btn-warning me-2" onClick={handleShowHint}>
            💡 {showHints ? "Next Hint" : "Show Hint"}
          </button>
          <button className="btn btn-sm btn-secondary me-2" onClick={handleReset}>
            🔄 Reset
          </button>
          <button className="btn btn-sm btn-success me-2" onClick={handleRunCode}>
            ▶️ Run
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleSubmit}>
            ✓ Submit
          </button>
        </div>
      </div>

      {showHints && (
        <div className="hint-box alert alert-warning">
          <strong>💡 Hint {currentHintIndex + 1} of {exercise.hints.length}:</strong> {exercise.hints[currentHintIndex]}
          {currentHintIndex < exercise.hints.length - 1 && (
            <div className="mt-2">
              <small className="text-muted">Click "Next Hint" for more help</small>
            </div>
          )}
        </div>
      )}

      {showTestResults && (
        <div className={`test-results alert ${validationStatus === 'success' ? 'alert-success' : 'alert-danger'}`}>
          <strong>{validationStatus === 'success' ? '✅ All Tests Passed!' : '❌ Some Tests Failed'}</strong>
          <ul className="mb-0 mt-2">
            {testResults.map((result, index) => (
              <li key={index} className={result.passed ? 'text-success' : 'text-danger'}>
                {result.message}
              </li>
            ))}
          </ul>
          {validationStatus === 'error' && exercise.hints.length > 0 && (
            <div className="mt-2">
              <small>💡 Try using the hints below for guidance!</small>
            </div>
          )}
        </div>
      )}

      <div className="code-editor-container">
        {/* Code Editor Side */}
        <div className="editor-panel">
          <div className="panel-header">
            <span className="fw-semibold">HTML/CSS/JS Editor</span>
          </div>
          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Preview Side */}
        <div className="preview-panel">
          <div className="panel-header">
            <span className="fw-semibold">Live Preview</span>
          </div>
          <div className="preview-content">
            <iframe
              title="preview"
              srcDoc={code}
              sandbox="allow-scripts"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                background: "white",
              }}
            />
          </div>
        </div>
      </div>

      <div className="expected-output mt-3">
        <strong>Expected Output:</strong>
        <div className="alert alert-info mt-2">
          <code>{exercise.expectedOutput}</code>
        </div>
      </div>

      <style>{`
        .code-editor-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          background: #f8f9fa;
          border-radius: 0;
          padding: 20px;
          box-sizing: border-box;
        }

        .code-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hint-box {
          margin-bottom: 15px;
          border-left: 4px solid #ffc107;
          animation: slideIn 0.3s ease-out;
        }

        .test-results {
          margin-bottom: 15px;
          border-left: 4px solid currentColor;
          animation: slideIn 0.3s ease-out;
        }

        .test-results ul {
          list-style: none;
          padding-left: 0;
        }

        .test-results li {
          padding: 4px 0;
          font-family: 'Courier New', monospace;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .code-editor-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          flex: 1;
          margin-bottom: 15px;
          width: 100%;
          min-height: 600px;
          height: 100%;
        }

        .editor-panel,
        .preview-panel {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          height: 100%;
          min-height: 600px;
        }

        .panel-header {
          background: #343a40;
          color: white;
          padding: 10px 15px;
          font-size: 14px;
        }

        .code-textarea {
          flex: 1;
          padding: 15px;
          border: none;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
          outline: none;
          background: #282c34;
          color: #abb2bf;
        }

        .code-textarea::selection {
          background: #3e4451;
        }

        .preview-content {
          flex: 1;
          overflow: auto;
          background: white;
        }

        .expected-output {
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .code-editor-container {
            grid-template-columns: 1fr;
            height: auto;
          }

          .editor-panel,
          .preview-panel {
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;
