import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'; // NEW
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { formatTime } from '@/lib/formatTime';
import Track1 from '@/assets/songs/12DP.mp3';
import Track1Art from '@/assets/songs/12DP.jpg';
import Track2 from '@/assets/songs/MysteriousPower.mp3';
import Track2Art from '@/assets/songs/MysteriousPower.jpg';

import Track3 from '@/assets/songs/TheFateOfOphelia.mp3';
import Track3Art from '@/assets/songs/TheFateOfOphelia.webp';
import Track4 from '@/assets/songs/Wood.mp3';
import Track4Art from '@/assets/songs/TheFateOfOphelia.webp';
import Track5 from '@/assets/songs/Dong.mp3';
import Track5Art from '@/assets/songs/Dong.jpeg';
import Track6 from '@/assets/songs/ALittleLove.mp3';
import Track6Art from '@/assets/songs/ALittleLove.jpg';
const songsList = [
  { title: 'A Little Love', artist: 'Fiona Fung', src: Track6, artwork: Track6Art },
  { title: 'Dong', artist: 'Power Station', src: Track5, artwork: Track5Art },
  {
    title: 'Barbie in the 12 Dancing Princesses Theme',
    artist: 'Fairy Lullaby',
    src: Track1,
    artwork: Track1Art,
  },
  {
    title: 'Wood',
    artist: 'Taylor Swift',
    src: Track4,
    artwork: Track4Art,
  },
  {
    title: 'Mysterious Power',
    artist: ' Ezra Furman & The Harpoons',
    src: Track2,
    artwork: Track2Art,
  },

  {
    title: 'The Fate of Ophelia',
    artist: 'Taylor Swift',
    src: Track3,
    artwork: Track3Art,
  },
];

export function MusicPlayerHorizontal({ playlist = songsList }) {
  const [songs] = useState(playlist);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  const currentSong = songs[currentSongIndex];
  const nextSong = songs[(currentSongIndex + 1) % songs.length];
  const [collapsed, setCollapsed] = useState(true);
  const [volume, setVolume] = useState(80); // NEW: volume 0–100
  const [showVolume, setShowVolume] = useState(false); // NEW: toggle slider
  const togglePlayPause = () => setIsPlaying((prev) => !prev);
  // keep audio volume in sync with state  // NEW
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const skipSong = (forward = true) => {
    setCurrentSongIndex((prev) =>
      forward ? (prev + 1) % songs.length : (prev - 1 + songs.length) % songs.length,
    );
  };

  useEffect(() => {
    if (isPlaying) audioRef.current.play();
    else audioRef.current.pause();
  }, [isPlaying, currentSongIndex]);

  return (
    <header
      className={`
    fixed bottom-0 right-0 left-0 mx-auto z-50 
    px-4 py-2
    transition-all duration-300 max-w-6xl opacity-95 hover:opacity-100
    ${collapsed && 'max-w-lg'}
  `}
    >
      <Card className="w-full mt-0 h-fit">
        <CardContent className="space-y-2 p-2">
          <div className="flex flex-row w-full justify-between items-center gap-4">
            {/* Album artwork */}
            <div className="flex flex-1/5 gap-2 items-center">
              <div className="flex aspect-square h-14 justify-start items-start">
                <img
                  src={currentSong.artwork}
                  alt={currentSong.title}
                  onClick={() => setCollapsed((c) => !c)}
                  className="w-full h-full rounded-sm object-cover shadow-lg ease-in-out duration-300 hover:brightness-90"
                />
              </div>
              <audio
                ref={audioRef}
                src={currentSong.src}
                onEnded={() => skipSong(true)}
                onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
                onLoadedMetadata={() => setDuration(audioRef.current.duration)}
              />{' '}
              <div className="flex flex-col flex-1 overflow-hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-md w-fit overflow-hidden line-clamp-1 text-card-foreground font-semibold relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[3px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
                      {currentSong.title}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{currentSong.title}</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-muted-foreground line-clamp-1 text-xs leading-tight">
                  {currentSong.artist}
                </p>
                {collapsed && (
                  <Slider
                    value={[currentTime]}
                    max={duration || 0}
                    step={1}
                    onValueChange={(val) => {
                      audioRef.current.currentTime = val[0];
                      setCurrentTime(val[0]);
                    }}
                    className="mt-2 flex-1 cursor-grab transition-opacity duration-300 opacity-70 hover:opacity-100 [&>span]:h-1 [&_[role=slider]]:opacity-0 [&_[role=slider]]:pointer-events-auto"
                  />
                )}
              </div>
            </div>
            {/* Middle: controls + slider (hidden when collapsed) */}
            {!collapsed && (
              <div className="flex flex-3/5 flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => skipSong(false)}
                  >
                    <SkipBack />
                  </Button>
                  <Button size="icon-sm" className="cursor-pointer" onClick={togglePlayPause}>
                    {isPlaying ? <Pause /> : <Play />}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => skipSong(true)}
                  >
                    <SkipForward />
                  </Button>
                </div>

                <div className="mt-1 w-full flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
                  <Slider
                    value={[currentTime]}
                    max={duration || 0}
                    step={1}
                    onValueChange={(val) => {
                      audioRef.current.currentTime = val[0];
                      setCurrentTime(val[0]);
                    }}
                    className="flex-1 cursor-grab transition-opacity duration-300 opacity-70 hover:opacity-100 [&>span]:h-1 [&_[role=slider]]:opacity-0 [&_[role=slider]]:pointer-events-auto"
                  />
                  <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
                </div>
              </div>
            )}{' '}
            <div className="flex flex-1/5 justify-end gap-2">
              {collapsed && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => skipSong(false)}
                  >
                    <SkipBack />
                  </Button>
                  <Button size="icon-sm" className="cursor-pointer" onClick={togglePlayPause}>
                    {isPlaying ? <Pause /> : <Play />}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => skipSong(true)}
                  >
                    <SkipForward />
                  </Button>
                </div>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon-sm" variant="ghost" className="cursor-pointer">
                    {volume === 0 ? <VolumeX /> : <Volume2 />}
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="end" className="w-40">
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={(val) => setVolume(val[0])}
                    className="flex-1 cursor-grab transition-opacity duration-300 opacity-70 hover:opacity-100 [&>span]:h-1 [&_[role=slider]]:opacity-0 [&_[role=slider]]:pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>{' '}
              <Button
                size="icon-sm"
                variant="ghost"
                className="cursor-pointer"
                onClick={() => setCollapsed((v) => !v)}
              >
                {collapsed ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </header>
  );
}
