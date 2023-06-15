import React, { useRef } from 'react';
import { hrZones, maxHR, minHR } from './App';

const Slider = ({ currentHeartRate, currentZoneFinded }) => {
  const ref = useRef(null);

  const width = ref?.current?.offsetWidth || 0;
  const compensations = 5 / 109 + 1;
  const hrGap = maxHR - minHR;
  const step = width / hrGap;
  const solo = step * (currentHeartRate - minHR);
  const gap = solo * compensations - solo;
  const positionPrep = solo * compensations - gap;
  const position = currentHeartRate <= minHR ? -10 : positionPrep;

  const sliderElementWidth = (el) => (el.end - el.start) * step * compensations + 'px';

  return (
    <div className="slider-container" ref={ref}>
      <div className="slider">
        {hrZones?.map((el) => (
          <div key={el.name} className="slider-elem" style={{ background: el.color, width: sliderElementWidth(el) }} />
        ))}
      </div>

      <div className="pointer">
        {!!currentZoneFinded && <div className="pointer-runner" style={{ left: position }} />}
      </div>
    </div>
  );
};

export default Slider;
