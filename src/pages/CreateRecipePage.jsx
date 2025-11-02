import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import { Button } from "@/components/ui/button";
import Footer from "../components/page-footer";
import { useAuth } from "../context/AuthContext";
import { Plus, CookingPot, ArrowLeft, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { RecipeFormSchema } from "../formSchema/recipeFormSchema"; // schema
import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setfile] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) navigate("/login");
  useEffect(() => {
    document.title = "Recipedia | Create Recipe";
  }, []);
  function previewFiles(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(reader.result);
      console.log(image);
    };
  }

  const form = useForm({
    resolver: zodResolver(RecipeFormSchema),
    defaultValues: {
      title: "",
      coverImage: "",
      cookingTime: "",
      dishType: "",
      ingredients: [{ name: "", measurement: "", amount: "" }],
      instructions: "",
    },
  });

  // Dynamic ingredients
  const { fields, append, remove } = useFieldArray({
    name: "ingredients",
    control: form.control,
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      if (!file) {
        toast.error("Please select an image");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("cookingTime", values.cookingTime);
      formData.append("dishType", values.dishType);
      formData.append("ingredients", JSON.stringify(values.ingredients));
      formData.append("instructions", values.instructions);
      formData.append("coverImage", file); // important: matches multer field name

      await api.post("/recipes/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Your dish is served!");
      navigate("/");
    } catch (error) {
      console.error("Create recipe error:", error);
      toast.error("Failed to create recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl mt-2 p-4">
        <Link to={"/"}>
          <Button variant="ghost" className="cursor-pointer">
            <ArrowLeft />
            <div className="hidden md:flex lg:flex">Back to Recipes</div>
          </Button>
        </Link>

        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Create your Recipe</CardTitle>
            <CardDescription>
              Share your favorite dish with the world — start by adding your
              ingredients and steps.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Recipe Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Give your masterpiece a name (e.g., Grandma’s Secret Apple Pie)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Make it catchy — your title is the first thing foodies
                        see!
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
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
                          <FormDescription>
                            Pick the dish’s role in the meal.
                          </FormDescription>
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="cursor-pointer h-9 border border-input bg-white">
                                <SelectValue placeholder="How long till we eat?" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              <SelectItem value="quick">
                                {"<"} 30 minutes
                              </SelectItem>
                              <SelectItem value="medium">
                                30-60 minutes
                              </SelectItem>
                              <SelectItem value="long">1-2 hours</SelectItem>
                              <SelectItem value="veryLong">
                                {">"} 2 hours
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Tell the clock what’s cooking.
                          </FormDescription>
                        </FormItem>
                      )}
                    />{" "}
                  </div>
                </div>

                {/* Ingredients dynamic list */}
                <FormField
                  control={form.control}
                  name="ingredients"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Ingredients <span className="text-red-500">*</span>
                      </FormLabel>

                      <div className="">
                        {fields.map((field, idx) => (
                          <div key={field.id} className="flex gap-2">
                            <FormField
                              control={form.control}
                              name={`ingredients.${idx}.amount`}
                              render={({ field }) => (
                                <FormItem className="w-1/6">
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
                                      <SelectGroup>
                                        <SelectLabel>Volume</SelectLabel>
                                        <SelectItem
                                          value="tsp"
                                          className="cursor-pointer"
                                        >
                                          tsp (teaspoon)
                                        </SelectItem>
                                        <SelectItem
                                          value="tbsp"
                                          className="cursor-pointer"
                                        >
                                          tbsp (tablespoon)
                                        </SelectItem>
                                        <SelectItem
                                          value="cup"
                                          className="cursor-pointer"
                                        >
                                          cup
                                        </SelectItem>
                                        <SelectItem
                                          value="ml"
                                          className="cursor-pointer"
                                        >
                                          ml
                                        </SelectItem>
                                        <SelectItem
                                          value="l"
                                          className="cursor-pointer"
                                        >
                                          l
                                        </SelectItem>
                                        <SelectItem
                                          value="fl oz"
                                          className="cursor-pointer"
                                        >
                                          fl oz
                                        </SelectItem>
                                      </SelectGroup>

                                      {/* Weight Units */}
                                      <SelectGroup>
                                        <SelectLabel>Weight</SelectLabel>
                                        <SelectItem
                                          value="g"
                                          className="cursor-pointer"
                                        >
                                          g (gram)
                                        </SelectItem>
                                        <SelectItem
                                          value="kg"
                                          className="cursor-pointer"
                                        >
                                          kg (kilogram)
                                        </SelectItem>
                                        <SelectItem
                                          value="oz"
                                          className="cursor-pointer"
                                        >
                                          oz (ounce)
                                        </SelectItem>
                                        <SelectItem
                                          value="lb"
                                          className="cursor-pointer"
                                        >
                                          lb (pound)
                                        </SelectItem>
                                      </SelectGroup>

                                      {/* Count / Other Units */}
                                      <SelectGroup>
                                        <SelectLabel>Other</SelectLabel>
                                        <SelectItem
                                          value="piece"
                                          className="cursor-pointer"
                                        >
                                          piece
                                        </SelectItem>
                                        <SelectItem
                                          value="slice"
                                          className="cursor-pointer"
                                        >
                                          slice
                                        </SelectItem>
                                        <SelectItem
                                          value="clove"
                                          className="cursor-pointer"
                                        >
                                          clove
                                        </SelectItem>
                                        <SelectItem
                                          value="stick"
                                          className="cursor-pointer"
                                        >
                                          stick
                                        </SelectItem>
                                        <SelectItem
                                          value="pinch"
                                          className="cursor-pointer"
                                        >
                                          pinch
                                        </SelectItem>
                                        <SelectItem
                                          value="dash"
                                          className="cursor-pointer"
                                        >
                                          dash
                                        </SelectItem>
                                        <SelectItem
                                          value="handful"
                                          className="cursor-pointer"
                                        >
                                          handful
                                        </SelectItem>
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`ingredients.${idx}.name`}
                              render={({ field }) => (
                                <Input
                                  className="w-3/6"
                                  placeholder="Ingredient name here"
                                  {...field}
                                />
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
                        onClick={() =>
                          append({ name: "", measurement: "", amount: "" })
                        }
                      >
                        <Plus />
                        Add Ingredient
                      </Button>
                      <FormDescription>
                        Fill in the amount, unit, and ingredient — repeat until
                        delicious. Use ingredient amounts for 4 servings
                        (original recipe).
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
                          placeholder="Step 1: Chop veggies… Step 2: Try not to cry over onions… Step 3: Sauté to glory!"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Write it step by step so even kitchen newbies can follow
                        along.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Image upload */}
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cover Photo<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl className="cursor-pointer">
                        <Input
                          type="file"
                          accept="image/*"
                          className="text-muted-foreground"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            field.onChange(file ?? null);
                            setfile(file);
                            if (file) previewFiles(file);
                          }}
                        ></Input>
                      </FormControl>
                      {/* <FormMessage /> */}
                      <FormDescription>
                        They say we eat with our eyes first — make it
                        drool-worthy!
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <div className="">
                  {image && (
                    <img
                      className="aspect-video h-48 object-cover border-accent border-1 rounded-sm"
                      src={image}
                      alt="Preview Image"
                    />
                  )}
                </div>
                <div className="flex w-full justify-end">
                  <Button
                    className={`cursor-pointer ${loading ? "opacity-60" : ""}`}
                    type="submit"
                    disabled={loading}
                  >
                    {" "}
                    <CookingPot /> {loading ? "Cooking..." : "Create Recipe"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>{" "}
      <Footer />
    </div>
  );
};

export default CreateRecipePage;
