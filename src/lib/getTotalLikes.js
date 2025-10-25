// Utility function to sum all likeCount values
export const getTotalLikes = (recipes) => {
  if (!Array.isArray(recipes)) return 0;
  return recipes.reduce((total, recipe) => total + (recipe.likeCount || 0), 0);
};
