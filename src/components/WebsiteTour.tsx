import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import Cookies from "js-cookie";

const tourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="text-center">
        <h3 className="font-display text-xl font-bold mb-2">Welcome to FinWise! 🎉</h3>
        <p className="text-sm text-muted-foreground">
          Let us show you around and help you start your wealth-building journey.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="features"]',
    content: (
      <div>
        <h3 className="font-display text-lg font-semibold mb-2">Powerful Features</h3>
        <p className="text-sm text-muted-foreground">
          Discover round-up investing, smart expense tracking, and community challenges designed for students.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="how-it-works"]',
    content: (
      <div>
        <h3 className="font-display text-lg font-semibold mb-2">Simple 4-Step Process</h3>
        <p className="text-sm text-muted-foreground">
          Link your UPI, round up purchases, auto-invest, and watch your money grow!
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="learn"]',
    content: (
      <div>
        <h3 className="font-display text-lg font-semibold mb-2">Financial Education</h3>
        <p className="text-sm text-muted-foreground">
          Access bite-sized lessons, quizzes, and our AI advisor KUBER for personalized tips.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="kuber-chat"]',
    content: (
      <div>
        <h3 className="font-display text-lg font-semibold mb-2">Meet KUBER 🤖</h3>
        <p className="text-sm text-muted-foreground">
          Your AI investment guide! Click here anytime to get personalized financial advice.
        </p>
      </div>
    ),
    placement: "left",
  },
  {
    target: '[data-tour="cta"]',
    content: (
      <div className="text-center">
        <h3 className="font-display text-lg font-semibold mb-2">Ready to Start?</h3>
        <p className="text-sm text-muted-foreground">
          Create your free account and begin investing with just ₹10!
        </p>
      </div>
    ),
    placement: "top",
  },
];

const WebsiteTour = () => {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const tourCompleted = Cookies.get("finwise_tour_completed");
    const consent = Cookies.get("finwise_privacy_consent");
    
    if (!tourCompleted && consent === "accepted") {
      const timer = setTimeout(() => setRunTour(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      Cookies.set("finwise_tour_completed", "true", { expires: 365 });
      setRunTour(false);
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(158 64% 52%)",
          backgroundColor: "hsl(222 47% 10%)",
          textColor: "hsl(210 40% 98%)",
          arrowColor: "hsl(222 47% 10%)",
          overlayColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: "hsl(158 64% 52%)",
          color: "hsl(222 47% 6%)",
          borderRadius: 8,
          fontWeight: 600,
        },
        buttonBack: {
          color: "hsl(210 40% 98%)",
        },
        buttonSkip: {
          color: "hsl(215 20% 55%)",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Get Started!",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  );
};

export default WebsiteTour;
