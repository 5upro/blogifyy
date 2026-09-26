import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_ENABLED, RECAPTCHA_SITE_KEY } from '../config/captcha';

class CaptchaBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('Captcha failed to render:', error);
    if (this.props.onUnavailable) this.props.onUnavailable();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

const Captcha = ({ onToken, onUnavailable }) => {
  if (!RECAPTCHA_ENABLED) return null;

  return (
    <CaptchaBoundary onUnavailable={onUnavailable}>
      <div className="flex justify-center pt-2">
        <ReCAPTCHA
          siteKey={RECAPTCHA_SITE_KEY}
          onChange={onToken}
          onErrored={() => onUnavailable && onUnavailable()}
          theme="dark"
        />
      </div>
    </CaptchaBoundary>
  );
};

export default Captcha;
