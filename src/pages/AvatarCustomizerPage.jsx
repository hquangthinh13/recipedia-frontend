import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import PreviewUserCard from '@/components/preview-user-card';
import {
  Scissors,
  Smile,
  Eye,
  Shirt,
  Palette,
  Glasses,
  Brush,
  Wand,
  Check,
  Laugh,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import logo from '@/assets/images/Recipedia-logo-square.svg';

const AvatarCustomizerPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [name, setName] = useState('Guest');
  const [createdAt, setCreatedAt] = useState(null);
  // === Core states ===
  const [skinColor, setSkinColor] = useState('f9c9b6');
  const [backgroundColor, setBackgroundColor] = useState('ffd5dc');
  const [hair, setHair] = useState('dannyPhantom');
  const [hairColor, setHairColor] = useState('000000');
  const [eyes, setEyes] = useState('eyes');
  const [mouth, setMouth] = useState('smile');
  const [shirt, setShirt] = useState('crew');
  const [shirtColor, setShirtColor] = useState('ffffff');
  const [eyebrows, setEyebrows] = useState('up');
  const [eyebrowsColor, setEyebrowsColor] = useState('000000');
  const [glasses, setGlasses] = useState('none');
  const [glassesColor, setGlassesColor] = useState('000000');
  const [facialHair, setFacialHair] = useState('none');
  const [facialHairColor, setFacialHairColor] = useState('000000');
  const [eyeShadowColor, setEyeShadowColor] = useState('ffffff');
  const [nose, setNose] = useState('curve');
  // === Current active section ===
  const [activeFeature, setActiveFeature] = useState('hair');

  useEffect(() => {
    document.title = 'Recipedia | Dress Your Chef';
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name ?? 'Guest');
      setCreatedAt(user.createdAt ? new Date(user.createdAt) : null);
    }
  }, [user]);
  const avatarUrl = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true
  &baseColor=${skinColor}
  &backgroundColor=${backgroundColor}
  &hair=${hair}
  &hairColor=${hairColor}
  &eyes=${eyes}
  &mouth=${mouth}
  &shirt=${shirt}
  &shirtColor=${shirtColor}
  &eyebrows=${eyebrows}
  &eyebrowsColor=${eyebrowsColor}
  &eyeShadowColor=${eyeShadowColor}
  &nose=${nose}
  ${
    facialHair !== 'none'
      ? `&facialHair=${facialHair}&facialHairColor=${facialHairColor}&facialHairProbability=100`
      : `&facialHairProbability=0`
  }
    ${
      glasses !== 'none'
        ? `&glasses=${glasses}&glassesColor=${glassesColor}&glassesProbability=100`
        : `&glassesProbability=0`
    }
  `.replace(/\s/g, '');
  const handleSaveAvatar = async () => {
    try {
      console.log('Avatar URL being sent:', avatarUrl);
      await api.post('/users/avatar', { avatarUrl });
      toast.success('Chef’s kiss! Everything saved beautifully');
      // force refresh user data from backend
      setUser((prev) => ({ ...prev, avatar: avatarUrl }));
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      console.error(err);
      toast.error('Oops! Something’s burnt. Try again!');
    }
  };

  // === Options ===
  const hairOptions = [
    { id: 'dannyPhantom', label: 'Danny Phantom' },
    { id: 'dougFunny', label: 'Doug' },
    { id: 'fonze', label: 'Fonze' },
    { id: 'full', label: 'Full' },
    { id: 'mrClean', label: 'Mr. Clean' },
    { id: 'mrT', label: 'Mr. T' },
    { id: 'pixie', label: 'Pixie' },
    { id: 'turban', label: 'Turban' },
  ];
  const eyesOptions = [
    { id: 'eyes', label: 'Default' },
    { id: 'eyesShadow', label: 'Shadow' },
    { id: 'round', label: 'Round' },
    { id: 'smiling', label: 'Smiling' },
    { id: 'smilingShadow', label: 'Smiling Shadow' },
  ];
  const noseOptions = [
    { id: 'curve', label: 'Curve' },
    { id: 'pointed', label: 'Pointed' },
    { id: 'tound', label: 'Tound' },
  ];
  const mouthOptions = [
    { id: 'frown', label: 'Frown' },
    { id: 'laughing', label: 'Laughing' },
    { id: 'nervous', label: 'Nervous' },
    { id: 'pucker', label: 'Pucker' },
    { id: 'sad', label: 'Sad' },
    { id: 'smile', label: 'Smile' },
    { id: 'smirk', label: 'Smirk' },
    { id: 'surprised', label: 'Surprised' },
  ];
  const shirtOptions = [
    { id: 'crew', label: 'Crew' },
    { id: 'collared', label: 'Collared' },
    { id: 'open', label: 'Open' },
  ];
  const eyebrowsOptions = [
    { id: 'down', label: 'Down' },
    { id: 'eyelashesDown', label: 'Eyelashes Down' },
    { id: 'eyelashesUp', label: 'Eyelashes Up' },
    { id: 'up', label: 'Up' },
  ];
  const glassesOptions = [
    { id: 'none', label: 'None' },

    { id: 'round', label: 'Round' },
    { id: 'square', label: 'Square' },
  ];
  const facialHairOptions = [
    { id: 'none', label: 'None' },
    { id: 'beard', label: 'Beard' },
    { id: 'scruff', label: 'Scruff' },
  ];

  // === Colors ===
  const skinColors = [
    'FFCCCC', // light pink
    'FFE6CC', // pale peach
    'f9c9b6', // soft warm light
    'E0AC69', // medium warm tan
    'C68642', // golden brown
    'ac6651', // reddish tan
    '8d5524', // deep brown
    '77311d', // darkest warm brown
    'B4B4B4', // gray (neutral transition)
    '80C878', // green tone
    '96D2FF', // blue tone
  ];

  const hairColors = [
    '000000',
    '6bd9e9',
    '9287ff',
    '77311d',
    'b35340',
    'ac6651',
    'd2eff3',
    'e0ddff',
    'f4d150',
    'f9c9b6',
    'fc909f',
    'feb47b',
    'ff7e5f',
    'ffeba4',
    'ffedef',
    'ffffff',
  ];
  const facialHairColors = [
    '000000',
    '6bd9e9',
    '9287ff',
    '77311d',
    'b35340',
    'ac6651',
    'd2eff3',
    'e0ddff',
    'f4d150',
    'f9c9b6',
    'fc909f',
    'feb47b',
    'ff7e5f',
    'ffeba4',
    'ffedef',
    'ffffff',
  ];

  const shirtColors = [
    '000000',
    '6bd9e9',
    '9287ff',
    '77311d',
    'b35340',
    'ac6651',
    'd2eff3',
    'e0ddff',
    'f4d150',
    'f9c9b6',
    'fc909f',
    'feb47b',
    'ff7e5f',
    'ffeba4',
    'ffedef',
    'ffffff',
  ];
  const eyebrowsColors = [
    '000000',
    '6bd9e9',
    '9287ff',
    '77311d',
    'ac6651',
    'd2eff3',
    'e0ddff',
    'f4d150',
    'f9c9b6',
    'fc909f',
    'ffeba4',
    'ffedef',
    'ffffff',
  ];
  const glassesColors = [
    '000000',
    '6bd9e9',
    '9287ff',
    '77311d',
    'b35340',
    'ac6651',
    'd2eff3',
    'e0ddff',
    'f4d150',
    'f9c9b6',
    'fc909f',
    'feb47b',
    'ff7e5f',
    'ffeba4',
    'ffedef',
    'ffffff',
  ];
  const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'feb47b'];
  const eyeShadowColors = ['d2eff3', 'e0ddff', 'ffeba4', 'ffedef', 'ffffff'];
  // === Button Feature Map ===
  const featureButtons = [
    { id: 'hair', label: 'Hair', icon: <Scissors className="w-5 h-5" /> },
    { id: 'eyes', label: 'Eyes', icon: <Eye className="w-5 h-5" /> },
    { id: 'eyebrows', label: 'Eyebrows', icon: <Brush className="w-5 h-5" /> },
    {
      id: 'facialHair',
      label: 'Facial Hair',
      icon: <Wand className="w-5 h-5" />,
    },
    { id: 'glasses', label: 'Glasses', icon: <Glasses className="w-5 h-5" /> },
    { id: 'nose', label: 'Nose', icon: <Smile className="w-5 h-5" /> },
    { id: 'mouth', label: 'Mouth', icon: <Laugh className="w-5 h-5" /> },
    { id: 'shirt', label: 'Shirt', icon: <Shirt className="w-5 h-5" /> },
    { id: 'color', label: 'Colors', icon: <Palette className="w-5 h-5" /> },
  ];
  if (!user)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia>
              <Link to={'/'} className="flex flex-1">
                <img src={logo} alt="Recipedia Logo" className="h-12" />
              </Link>
            </EmptyMedia>
            <EmptyTitle>Looks like you haven’t logged in yet</EmptyTitle>
            <EmptyDescription>Sign in to customize your own chef.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button className="cursor-pointer" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button className="cursor-pointer" onClick={() => navigate('/')} variant="outline">
                Back to Home
              </Button>
            </div>
          </EmptyContent>
        </Empty>{' '}
      </div>
    );
  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row gap-4 max-w-6xl p-4 mx-auto mb-12">
        <div className="flex lg:w-lg flex-col-reverse lg:flex-col gap-4">
          <PreviewUserCard avatarUrl={avatarUrl} name={name || 'Guest'} createdAt={createdAt} />
          {/* <MusicPlayer className="w-lg lg:w-fit" /> */}
        </div>

        <div className="flex flex-col gap-2 flex-2/3 ">
          <div
            className="flex flex-wrap lg:flex-wrap justify-center w-full
             gap-1 md:gap-0 overflow-x-auto border-2 border-[var(--accent)] 
             rounded-md"
          >
            {featureButtons.map((btn) => (
              <Button
                key={btn.id}
                variant="ghost"
                onClick={() => setActiveFeature(btn.id)}
                className={`cursor-pointer flex-1 min-w-[100px] sm:min-w-[120px]
                  rounded-none md:rounded-none
                  flex items-center justify-center px-3 py-2 text-sm md:text-sm
                  whitespace-nowrap transition-colors
                  ${
                    activeFeature === btn.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'hover:bg-[var(--accent)]/20'
                  }`}
              >
                <span className="flex items-center gap-2">
                  {btn.icon}
                  <span>{btn.label}</span>
                </span>
              </Button>
            ))}
          </div>
          <Card className="">
            <CardContent className="space-y-6 p-6">
              {/* === Feature Tabs === */}
              <div className="flex-1 space-y-2">
                {activeFeature === 'hair' && (
                  <>
                    <FeatureSelector
                      title="Hair"
                      options={hairOptions}
                      selected={hair}
                      onSelect={setHair}
                      colorParam={`&hairColor=${hairColor}`}
                    />
                    <ColorPalette
                      title="Hair Color"
                      colors={hairColors}
                      selected={hairColor}
                      onSelect={setHairColor}
                    />
                  </>
                )}

                {activeFeature === 'mouth' && (
                  <FeatureSelector
                    title="Mouth"
                    options={mouthOptions}
                    selected={mouth}
                    onSelect={setMouth}
                  />
                )}
                {activeFeature === 'nose' && (
                  <FeatureSelector
                    title="Nose"
                    options={noseOptions}
                    selected={nose}
                    onSelect={setNose}
                  />
                )}
                {activeFeature === 'eyes' && (
                  <>
                    <FeatureSelector
                      title="Eyes"
                      options={eyesOptions}
                      selected={eyes}
                      onSelect={setEyes}
                    />
                    <ColorPalette
                      title="Eye Shadow Color"
                      colors={eyeShadowColors}
                      selected={eyeShadowColor}
                      onSelect={setEyeShadowColor}
                    />
                  </>
                )}
                {activeFeature === 'eyebrows' && (
                  <>
                    <FeatureSelector
                      title="Eyebrows"
                      options={eyebrowsOptions}
                      selected={eyebrows}
                      onSelect={setEyebrows}
                      colorParam={`&eyebrowsColor=${eyebrowsColor}`}
                    />
                    <ColorPalette
                      title="Eyebrows Color"
                      colors={eyebrowsColors}
                      selected={eyebrowsColor}
                      onSelect={setEyebrowsColor}
                    />
                  </>
                )}

                {activeFeature === 'glasses' && (
                  <>
                    <FeatureSelector
                      title="Glasses"
                      options={glassesOptions}
                      selected={glasses}
                      onSelect={setGlasses}
                      colorParam={`&glassesColor=${glassesColor}`}
                    />
                    <ColorPalette
                      title="Glasses Color"
                      colors={glassesColors}
                      selected={glassesColor}
                      onSelect={setGlassesColor}
                    />
                  </>
                )}
                {activeFeature === 'facialHair' && (
                  <>
                    <FeatureSelector
                      title="Facial Hair"
                      options={facialHairOptions}
                      selected={facialHair}
                      onSelect={setFacialHair}
                      colorParam={`&facialHairColor=${facialHairColor}`}
                    />
                    <ColorPalette
                      title="Facial Hair Color"
                      colors={facialHairColors}
                      selected={facialHairColor}
                      onSelect={setFacialHairColor}
                    />
                  </>
                )}
                {activeFeature === 'shirt' && (
                  <>
                    <FeatureSelector
                      title="Shirt"
                      options={shirtOptions}
                      selected={shirt}
                      onSelect={setShirt}
                      colorParam={`&shirtColor=${shirtColor}`}
                    />
                    <ColorPalette
                      title="Shirt Color"
                      colors={shirtColors}
                      selected={shirtColor}
                      onSelect={setShirtColor}
                    />
                  </>
                )}

                {activeFeature === 'color' && (
                  <>
                    <ColorPalette
                      title="Skin Color"
                      colors={skinColors}
                      selected={skinColor}
                      onSelect={setSkinColor}
                    />

                    <ColorPalette
                      title="Background Color"
                      colors={bgColors}
                      selected={backgroundColor}
                      onSelect={setBackgroundColor}
                    />
                  </>
                )}
              </div>
              <div className="w-full flex justify-end mt-2">
                <Button onClick={handleSaveAvatar} className="cursor-pointer">
                  <Check />
                  Serve the Look
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Switch Buttons */}
      </div>
    </div>
  );
};

const FeatureSelector = ({ title, options, selected, onSelect, colorParam = '' }) => (
  <div className="w-full">
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
      {options.map((opt) => {
        const paramName = title
          .replace(/\s+/g, '') // remove spaces
          .replace(/^./, (c) => c.toLowerCase()); // lowercase first letter

        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`cursor-pointer border rounded-lg p-2 hover:border-primary transition ${
              selected === opt.id ? 'border-primary ring-2 ring-primary/30' : ''
            }`}
          >
            <img
              src={`https://api.dicebear.com/9.x/micah/svg?${
                opt.id === 'none'
                  ? `${paramName}Probability=0&flip=true`
                  : `${paramName}=${opt.id}${colorParam}&flip=true&${paramName}Probability=100`
              }`}
              alt={opt.label}
              className="w-12 h-12 mx-auto"
            />

            <p className="text-xs text-muted-foreground text-center mt-1">{opt.label}</p>
          </button>
        );
      })}
    </div>
  </div>
);

const ColorPalette = ({ title, colors, selected, onSelect }) => (
  <div className="w-full max-w-2xl">
    <h4 className="font-medium text-md mb-2">{title}</h4>
    <div className="flex gap-2 flex-wrap">
      {colors.map((color) => (
        <button
          key={color}
          className={`cursor-pointer w-8 h-8 rounded-md border transition hover:ring-2 hover:ring-primary hover:border-primary ${
            selected === color ? 'ring-2 ring-primary border-primary' : 'border-accent/90'
          }`}
          style={{ backgroundColor: `#${color}` }}
          onClick={() => onSelect(color)}
        />
      ))}
    </div>
  </div>
);

export default AvatarCustomizerPage;
