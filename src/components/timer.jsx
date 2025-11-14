import React, { useRef } from 'react';
import { useState, useEffect } from 'react';
import { Pause, RotateCcw, AlarmClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import tick from '@/assets/sfx/tick.wav';
import ring from '@/assets/sfx/ring.wav';
export function Timer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const tickSound = useRef(null);
  const ringSound = useRef(null);

  useEffect(() => {
    tickSound.current = new Audio(tick);
    ringSound.current = new Audio(ring);

    // Optional: preload the audio for smoother playback
    tickSound.current.load();
    ringSound.current.load();
  }, []);

  const getTotalSeconds = () => {
    return hours * 3600 + minutes * 60 + seconds;
  };

  useEffect(() => {
    if (!isRunning || remaining <= 0) {
      if (remaining <= 0) setIsRunning(false);
      return;
    }

    const interval = setInterval(() => {
      setRemaining((s) => {
        const newTime = s - 1;
        if (newTime <= 0) {
          setIsRunning(false);
          ringSound.current.play(); // play ring when done

          return 0;
        } else {
          tickSound.current.currentTime = 0;
          tickSound.current.play(); // play tick sound each second
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  useEffect(() => {
    const totalSeconds = getTotalSeconds();
    setRemaining(totalSeconds);
  }, [hours, minutes, seconds]);

  const toggle = () => setIsRunning(!isRunning);

  const reset = () => {
    setHours(0);
    setMinutes(1);
    setSeconds(0);
    const totalSeconds = getTotalSeconds();
    setRemaining(totalSeconds);
    setIsRunning(false);
  };

  const handleHoursChange = (e) => {
    const value = Math.max(0, Number.parseInt(e.target.value) || 0);
    setHours(value);
    setIsRunning(false);
  };

  const handleMinutesChange = (e) => {
    const value = Math.max(0, Math.min(60, Number.parseInt(e.target.value) || 0));
    setMinutes(value);
    setIsRunning(false);
  };

  const handleSecondsChange = (e) => {
    const value = Math.max(0, Math.min(60, Number.parseInt(e.target.value) || 0));
    setSeconds(value);
    setIsRunning(false);
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="hidden md:flex items-center px-3 py-2 rounded-lg w-sm">
      <CardContent className="p-0 flex flex-row justify-between w-full items-center gap-2">
        <div className="flex flex-row gap-2">
          <Input
            type="number"
            min="0"
            value={hours}
            onChange={handleHoursChange}
            disabled={isRunning}
            placeholder="h"
            className="h-6 w-12 text-sm text-muted-foreground text-center px-1 font-normal"
          />
          <span className="text-sm">:</span>
          <Input
            type="number"
            min="0"
            max="60"
            value={minutes.toString().padStart(2, '0')}
            onChange={handleMinutesChange}
            disabled={isRunning}
            placeholder="m"
            className="h-6 w-12 text-sm text-muted-foreground text-center px-1 font-normal"
          />
          <span className="text-sm">:</span>
          <Input
            type="number"
            min="0"
            max="60"
            value={seconds.toString().padStart(2, '0')}
            onChange={handleSecondsChange}
            disabled={isRunning}
            placeholder="s"
            className="h-6 w-12 text-sm text-muted-foreground text-center px-1 font-normal"
          />
        </div>
        <span className="text-sm text-primary font-medium min-w-12">{formatTime(remaining)}</span>{' '}
        <div className="flex flex-row gap-2">
          <Button size="icon" variant="ghost" className="cursor-pointer h-6 w-6" onClick={toggle}>
            {isRunning ? <Pause className="h-3 w-3" /> : <AlarmClock className="h-3 w-3" />}
          </Button>
          <Button size="icon" variant="ghost" className="cursor-pointer h-6 w-6" onClick={reset}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
