import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/navbar";
import { Button } from "@/components/ui/button";

import { Plus, CookingPot, ArrowLeft, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { RecipeFormSchema } from "../lib/formSchema"; // your schema
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
  const form = useForm({
    resolver: zodResolver(RecipeFormSchema),
    defaultValues: {
      title: "",
      coverImage: null,
      cookingTime: "",
      dishType: "",
      ingredients: [{ name: "", amount: "" }],
      instructions: "",
    },
  });

  // Dynamic ingredients
  const { fields, append, remove } = useFieldArray({
    name: "ingredients",
    control: form.control,
  });

  const onSubmit = (values) => {
    console.log("Form submitted:", values);
    toast.success("Recipe created!");
    // TODO: upload coverImage to Cloudinary here
    // then send payload with image URL to backend
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl mt-2 p-4">
        <Link to={"/"}>
          <Button variant="ghost" className="cursor-pointer">
            <ArrowLeft />
            <div className="hidden md:flex lg:flex">Back to Recipes</div>
          </Button>
        </Link>

        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Create your Recipe</CardTitle>
            <CardDescription>Share your recipe</CardDescription>
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

                <div className="w-full flex flex-row gap-2">
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
                            What stage of the feast does this recipe shine in?
                          </FormDescription>
                          {/* <FormMessage /> */}
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Time to Make dropdown */}
                  <div className="flex-1">
                    <FormField
                      className="flex flex-1"
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
                            Tell the clock what’s cooking
                          </FormDescription>
                          {/* <FormMessage /> */}
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

                      <div className="space-y-2">
                        {fields.map((field, idx) => (
                          <div key={field.id} className="flex gap-2">
                            <FormField
                              control={form.control}
                              name={`ingredients.${idx}.amount`}
                              render={({ field }) => (
                                <FormItem className="w-1/6">
                                  <Input
                                    // className="w-1/6"
                                    placeholder="Amount"
                                    {...field}
                                  />
                                  {/* <FormDescription>Hello</FormDescription> */}
                                  {/* <FormMessage /> */}
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`ingredients.${idx}.measurement`}
                              render={({ field }) => (
                                <FormItem className="w-2/6">
                                  <Input
                                    // className="w-1/6"
                                    placeholder="Measurement"
                                    {...field}
                                  />
                                  {/* <FormDescription>Hello</FormDescription> */}
                                  {/* <FormMessage /> */}
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
                        along
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
                <div className="flex w-full justify-end">
                  <Button className="cursor-pointer">
                    {" "}
                    <CookingPot /> Create Recipe
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateRecipePage;
