import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { formatTime } from "@/lib/formatTime";
import Track1 from "@/assets/songs/12DP.mp3";
import Track1Art from "@/assets/songs/12DP.jpg";
import Track2 from "@/assets/songs/MysteriousPower.mp3";
import Track2Art from "@/assets/songs/MysteriousPower.jpg";

import Track3 from "@/assets/songs/TheFateOfOphelia.mp3";
import Track3Art from "@/assets/songs/TheFateOfOphelia.webp";
import Track4 from "@/assets/songs/Wood.mp3";
import Track4Art from "@/assets/songs/TheFateOfOphelia.webp";
const songsList = [
  {
    title: "Barbie in the 12 Dancing Princesses Theme",
    artist: "Fairy Lullaby",
    src: Track1,
    artwork: Track1Art,
  },
  {
    title: "Mysterious Power",
    artist: " Ezra Furman & The Harpoons",
    src: Track2,
    artwork: Track2Art,
  },
  //   {
  //     title: "Vũ Trụ Cò Bay",
  //     artist: "Phương Mỹ Chi",
  //     src: Track2,
  //     artwork: Track2Art,
  //   },
  {
    title: "Wood",
    artist: "Taylor Swift",
    src: Track4,
    artwork: Track4Art,
  },
  {
    title: "The Fate of Ophelia",
    artist: "Taylor Swift",
    src: Track3,
    artwork: Track3Art,
  },
];

export function MusicPlayer({ playlist = songsList }) {
  const [songs] = useState(playlist);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  const currentSong = songs[currentSongIndex];
  const nextSong = songs[(currentSongIndex + 1) % songs.length];

  const togglePlayPause = () => setIsPlaying((prev) => !prev);

  const skipSong = (forward = true) => {
    setCurrentSongIndex((prev) =>
      forward
        ? (prev + 1) % songs.length
        : (prev - 1 + songs.length) % songs.length
    );
  };

  useEffect(() => {
    if (isPlaying) audioRef.current.play();
    else audioRef.current.pause();
  }, [isPlaying, currentSongIndex]);

  return (
    <Card className="lg:w-sm mt-0 h-fit">
      {/* <CardHeader>
        <CardTitle className="">{currentSong.title}</CardTitle>
        <p className="text-gray-400">{currentSong.artist}</p>
      </CardHeader> */}
      <CardContent className="space-y-2 p-6">
        <div className="flex flex-row w-full justify-start items-start gap-4">
          {/* Album artwork */}
          <div className="flex justify-start items-start">
            <img
              src={currentSong.artwork}
              alt={currentSong.title}
              className="aspect-square h-32 rounded-sm object-cover shadow-lg ease-in-out duration-300 hover:brightness-90"
            />
          </div>{" "}
          <audio
            ref={audioRef}
            src={currentSong.src}
            onEnded={() => skipSong(true)}
            onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
            onLoadedMetadata={() => setDuration(audioRef.current.duration)}
          />{" "}
          <div className="flex flex-1 flex-col  min-w-0 overflow-hidden items-start gap-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-lg overflow-hidden line-clamp-1 text-card-foreground font-semibold relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[3px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
                  {currentSong.title}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentSong.title}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-muted-foreground line-clamp-1 text-sm leading-tight">
              {currentSong.artist}
            </p>{" "}
            {/* SLider */}
            <div className="mt-2 w-full">
              <Slider
                value={[currentTime]}
                max={duration || 0}
                step={1}
                onValueChange={(val) => {
                  audioRef.current.currentTime = val[0];
                  setCurrentTime(val[0]);
                }}
                className="cursor-grab transition-opacity duration-300 opacity-70 hover:opacity-100 [&>span]:h-1 [&_[role=slider]]:opacity-0 [&_[role=slider]]:pointer-events-auto"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex justify-center items-center gap-2 mt-2">
              <Button
                size="icon"
                className="cursor-pointer"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="=" /> : <Play className="" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="cursor-pointer"
                onClick={() => skipSong(false)}
              >
                <SkipBack className="" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="cursor-pointer"
                onClick={() => skipSong(true)}
              >
                <SkipForward className="" />
              </Button>
            </div>
            <p className="flex flex-col gap-0 mt-2 text-xs">
              <span className="text-muted-foreground  leading-tight">
                Up next
              </span>
              <span className="line-clamp-1 font-semibold text-sm text-card-foreground leading-tight">
                {nextSong.title}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
