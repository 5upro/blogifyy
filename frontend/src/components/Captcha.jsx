import React, { useEffect, useRef } from 'react';
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

const Captcha = ({ onToken, onUnavailable, resetKey = 0 }) => {
  const captchaRef = useRef(null);

  useEffect(() => {
    if (resetKey === 0 || !captchaRef.current) return;
    // reCAPTCHA v2 tokens are single-use, so clear the widget after every submit.
    captchaRef.current.reset();
    if (onToken) onToken(null);
  }, [resetKey, onToken]);

  if (!RECAPTCHA_ENABLED) return null;

  return (
    <CaptchaBoundary onUnavailable={onUnavailable}>
      <div className="flex justify-center pt-2">
        <ReCAPTCHA
          ref={captchaRef}
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
