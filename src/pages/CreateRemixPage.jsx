import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import Spinner from '@/components/spinner';
import RecipeCardPreview from '@/components/recipe-card-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, CookingPot, Italic, Plus, Trash2 } from 'lucide-react';
import logo from '@/assets/images/Recipedia-logo-square.svg';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { unitGroups } from '@/lib/unitGroups';
import { RecipeFormSchema } from '@/formSchema/recipeFormSchema';

const CreateRemixPage = () => {
  const navigate = useNavigate();
  const { id: parentId } = useParams(); // parent recipe id from /recipes/:id/remix
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [image, setImage] = useState(''); // preview image
  const [loading, setLoading] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(true);
  const [parentRecipe, setParentRecipe] = useState(null);

  useEffect(() => {
    document.title = 'Recipedia | Remix Recipe';
  }, []);

  // React Hook Form setup (same schema as original create)
  const form = useForm({
    resolver: zodResolver(RecipeFormSchema),
    defaultValues: {
      title: '',
      coverImage: '',
      cookingTime: '',
      dishType: '',
      ingredients: [{ name: '', measurement: '', amount: '' }],
      instructions: '',
      remixNote: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'ingredients',
    control: form.control,
  });

  const watchedTitle = form.watch('title');
  const watchedDishType = form.watch('dishType');
  const watchedCookingTime = form.watch('cookingTime');

  // Preview recipe based on form values + preview image
  const previewRecipe = {
    _id: 'preview',
    title: watchedTitle || 'Preview remix',
    coverImage: image || '',
    dishType: watchedDishType || 'main',
    cookingTime: watchedCookingTime || 'medium',
    author: {
      _id: user?.id,
      name: user?.name,
      avatar: user?.avatar,
    },
    createdAt: new Date().toISOString(),
    likes: [],
    comments: [],
    likedByUser: false,
  };

  // Preview file change
  function previewFiles(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(reader.result);
    };
  }

  // Fetch parent recipe and prefill form
  useEffect(() => {
    const fetchParentRecipe = async () => {
      try {
        setLoadingRecipe(true);
        const { data } = await api.get(`/recipes/${parentId}`);
        setParentRecipe(data);

        // Prefill form with parent data
        form.reset({
          title: `${data.title} (Remix)`,
          coverImage: '',
          cookingTime: data.cookingTime || '',
          dishType: data.dishType || '',
          ingredients:
            Array.isArray(data.ingredients) && data.ingredients.length > 0
              ? data.ingredients.map((ing) => ({
                  name: ing.name || '',
                  measurement: ing.measurement || '',
                  amount: ing.amount ?? '', // could be number; RHF will handle it
                }))
              : [{ name: '', measurement: '', amount: '' }],
          instructions: data.instructions || '',
          remixNote: '',
        });
      } catch (error) {
        console.error('Failed to load parent recipe:', error);
        toast.error('Failed to load recipe for remix');
        navigate(`/recipes/${parentId}`);
      } finally {
        setLoadingRecipe(false);
      }
    };

    fetchParentRecipe();
  }, [parentId, form, navigate]);

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('cookingTime', values.cookingTime);
      formData.append('dishType', values.dishType);
      formData.append('ingredients', JSON.stringify(values.ingredients));
      formData.append('instructions', values.instructions);

      // remixNote is optional
      if (values.remixNote && values.remixNote.trim()) {
        formData.append('remixNote', values.remixNote.trim());
      }

      // For remix:
      // - if file present → upload new image
      // - if no file → backend will reuse parent's coverImage
      if (file) {
        formData.append('coverImage', file);
      }

      const res = await api.post(`/recipes/${parentId}/remix`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Your remix is served!');
      navigate(`/recipes/${res.data.recipe._id}`);
    } catch (error) {
      console.error('Create remix error:', error);
      toast.error('Failed to create remix');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRecipe) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!parentRecipe) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia>
              <Link to={'/'} className="flex flex-1">
                <img src={logo} alt="Recipedia Logo" className="h-12" />
              </Link>
            </EmptyMedia>
            <EmptyTitle>Recipe not found</EmptyTitle>
            <EmptyDescription>The requested recipe doesn’t exist.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button className="cursor-pointer" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </EmptyContent>
        </Empty>{' '}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl mt-2 p-4">
        <Link to={`/recipes/${parentId}`}>
          <Button variant="ghost" className="cursor-pointer">
            <ArrowLeft />
            <div className="hidden md:flex lg:flex">
              <>
                Back to{'\u00A0'} <em className=""> {parentRecipe.title}</em>
              </>
            </div>
          </Button>
        </Link>

        <div className="flex lg:flex-row flex-col gap-4 items-start mt-2">
          <Card className="flex-2/3">
            <CardHeader>
              <CardTitle>Remix this Recipe</CardTitle>
              <CardDescription>
                Start from <span className="font-semibold">{parentRecipe.title}</span> and add your
                own twist — tweak ingredients, steps, or style.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Remix Name<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Give your remix a name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Let others know this is your version of the original.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="w-full flex flex-row gap-3">
                    <div className="flex-1">
                      {/* Dish Type dropdown */}
                      <FormField
                        control={form.control}
                        name="dishType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Dish Type<span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="cursor-pointer h-9 border border-input bg-white">
                                  <SelectValue placeholder="Select dish type" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <SelectItem value="starter">Starter</SelectItem>
                                <SelectItem value="main">Main</SelectItem>
                                <SelectItem value="side">Side</SelectItem>
                                <SelectItem value="dessert">Dessert</SelectItem>
                                <SelectItem value="drink">Drink</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Same type as original, or change it.</FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Time to Make dropdown */}
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="cookingTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Time to Make<span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="cursor-pointer h-9 border border-input bg-white">
                                  <SelectValue placeholder="How long till we eat?" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <SelectItem value="quick">{'<'} 30 minutes</SelectItem>
                                <SelectItem value="medium">30-60 minutes</SelectItem>
                                <SelectItem value="long">1-2 hours</SelectItem>
                                <SelectItem value="veryLong">{'>'} 2 hours</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Keep or tweak the cooking time.</FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  {/* Ingredients dynamic list (same as CreateRecipePage) */}
                  <FormField
                    control={form.control}
                    name="ingredients"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Ingredients <span className="text-red-500">*</span>
                        </FormLabel>

                        <div>
                          {fields.map((field, idx) => (
                            <div key={field.id} className="flex gap-2">
                              <FormField
                                control={form.control}
                                name={`ingredients.${idx}.amount`}
                                render={({ field }) => (
                                  <FormItem className="w-2/6">
                                    <Input placeholder="Amount" {...field} />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`ingredients.${idx}.measurement`}
                                render={({ field }) => (
                                  <FormItem className="w-2/6">
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="cursor-pointer h-9 border border-input bg-white">
                                          <SelectValue placeholder="Units" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="max-h-60 overflow-y-auto">
                                        {unitGroups.map((group) => (
                                          <SelectGroup key={group.label}>
                                            <SelectLabel>{group.label}</SelectLabel>
                                            {group.options.map((opt) => (
                                              <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                                className="cursor-pointer"
                                              >
                                                {opt.label}
                                              </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`ingredients.${idx}.name`}
                                render={({ field }) => (
                                  <Input className="w-2/6" placeholder="Ingredient" {...field} />
                                )}
                              />

                              <Button
                                variant="outline"
                                size="icon"
                                className="cursor-pointer"
                                disabled={idx === 0}
                                onClick={() => remove(idx)}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => append({ name: '', measurement: '', amount: '' })}
                        >
                          <Plus />
                          Add Ingredient
                        </Button>
                        <FormDescription>
                          Start from the original ingredients and tweak them for your version.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  {/* Instructions */}
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          How to Cook It<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="border border-input bg-white"
                            rows="7"
                            placeholder="Describe how your remix is cooked..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          You can reuse the original steps or rewrite them to match your style.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  {/* Image upload (optional for remix) */}
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Cover Photo <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl className="cursor-pointer">
                          <Input
                            type="file"
                            accept="image/*"
                            className="text-muted-foreground"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              field.onChange(file ?? null);
                              if (!file) return;

                              if (!file.type.startsWith('image/')) {
                                toast.error('Please upload a valid image file');
                                e.target.value = '';
                                return;
                              }
                              setFile(file);
                              previewFiles(file);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a high-quality image — most image formats are accepted (JPG, PNG,
                          WEBP, HEIC, etc.).
                        </FormDescription>
                      </FormItem>
                    )}
                  />{' '}
                  {/* Remix note */}
                  <FormField
                    control={form.control}
                    name="remixNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remix Note</FormLabel>
                        <FormControl>
                          <Textarea
                            className="border border-input bg-white"
                            rows="3"
                            placeholder="What did you change? e.g. Used coconut milk instead of cream, doubled the chili, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This note helps others quickly see how your remix differs from the
                          original.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  {image && (
                    <img
                      className="aspect-video h-48 object-cover border-accent border-1 rounded-sm"
                      src={image}
                      alt="Preview Image"
                    />
                  )}
                  <div className="flex w-full justify-end">
                    <Button
                      className={`cursor-pointer ${loading ? 'opacity-60' : ''}`}
                      type="submit"
                      disabled={loading}
                    >
                      <CookingPot /> {loading ? 'Remixing...' : 'Remix'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 lg:w-sm">
            <RecipeCardPreview className="flex-1/4 flex" isRemix={true} recipe={previewRecipe} />
            {/* <MusicPlayer className="w-lg lg:w-fit" /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRemixPage;
