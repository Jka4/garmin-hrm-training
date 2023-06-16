import React, { useState, useEffect } from 'react';
import Slider from './components/Slider';

let hrm = { id: 'EzpcWrVsiXwz5gsmsWmNsg==', name: 'HRM-Pro:121191' };

export const minHR = 97;

export const maxHR = 194;

export const hrZones = [
  { name: 1, color: 'gray', start: minHR, end: 115 },
  { name: 2, color: 'blue', start: 116, end: 134 },
  { name: 3, color: 'green', start: 135, end: 153 },
  { name: 4, color: 'orange', start: 154, end: 173 },
  { name: 5, color: 'red', start: 174, end: maxHR },
];

const App = () => {
  const [currentHeartRate, setCurrentHeartRate] = useState(0);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [deviceName, setDeviceName] = useState(null);

  const heartRateChange = (event) => {
    const value = event.target.value;
    const currentHeartRate = value.getUint8(1);

    const isConnected = event.target.service.device.gatt.connected;

    setIsDeviceConnected(!!isConnected);
    setCurrentHeartRate(currentHeartRate);
  };

  const BLEConnect = () => {
    // @ts-ignore
    return navigator.bluetooth
      .requestDevice({ filters: [{ services: ['heart_rate'] }] })
      .then((device) => {
        device.addEventListener('gattserverdisconnected', () => {
          setIsDeviceConnected(false);
        });

        return device.gatt.connect();
      })
      .then((server) => {
        return server.getPrimaryService('heart_rate');
      })
      .then((service) => {
        return service.getCharacteristic('heart_rate_measurement');
      })
      .then((character) => {
        return character.startNotifications().then((_) => {
          character.addEventListener('characteristicvaluechanged', (e) => {
            heartRateChange(e);
          });
        });
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    // @ts-ignore
    navigator.bluetooth
      .getDevices()
      .then((res) => {
        const device = res.find((el) => el.name === hrm.name);

        if (device) setDeviceName(device.name);

        device.addEventListener('gattserverdisconnected', () => {
          setIsDeviceConnected(false);
        });

        if (!isDeviceConnected) return device.gatt.connect();
        return null;
      })
      .then((server) => {
        return server.getPrimaryService('heart_rate');
      })
      .then((service) => {
        return service.getCharacteristic('heart_rate_measurement');
      })
      .then((character) => {
        return character.startNotifications().then(() => {
          character.addEventListener('characteristicvaluechanged', (e) => {
            heartRateChange(e);
          });
        });
      })
      .catch((e) => console.error(e));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentZoneFinded = hrZones.find((el) => el.start <= currentHeartRate && el.end >= currentHeartRate);
  const colorBackground = `${currentHeartRate > maxHR ? 'red' : currentZoneFinded?.color || 'white'}`;

  return (
    <div id="app">
      <button onClick={BLEConnect}>{isDeviceConnected ? 'CONNECTED' : 'START'}</button>

      <span>device: {isDeviceConnected ? deviceName : '-'}</span>

      <Slider currentHeartRate={currentHeartRate} currentZoneFinded={currentZoneFinded} />

      <div className="gauge" style={{ background: colorBackground }}>
        <div className="title">HR:</div>
        <div className="hear-rate">{currentHeartRate}</div>
      </div>
    </div>
  );
};

export default App;
