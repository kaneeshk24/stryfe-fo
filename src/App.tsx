import HandTracking from './components/HandTracking';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Hand Tracking Demo
        </h1>
        <div className="flex justify-center">
          <HandTracking width={640} height={480} />
        </div>
        <div className="mt-8 text-center text-gray-600">
          <p>Show your hands to the camera to see the tracking in action!</p>
          <p className="mt-2 text-sm">The green lines show hand connections, while red dots indicate landmarks.</p>
          <p className="mt-2 text-sm">Show a "Pointing_Up" gesture to start the stopwatch.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
