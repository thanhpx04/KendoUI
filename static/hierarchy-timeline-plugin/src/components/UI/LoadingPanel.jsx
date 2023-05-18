const loadingStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: '1000',

};

const LoadingPanel = () => {
  return (
    <div className="k-loading-mask" style={loadingStyle}>
      <span className="k-loading-text">Loading</span>
      <div className="k-loading-image"></div>
      <div className="k-loading-color"></div>
    </div>
  );
};

export default LoadingPanel