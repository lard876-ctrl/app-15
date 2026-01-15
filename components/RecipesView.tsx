
import React, { useState, useEffect, useMemo } from 'react';
import { FoodItem, Recipe, UserProfile, AllergySeverity } from '../types';
import { getRecipeSuggestions, generateFoodImage } from '../services/geminiService';
import { 
  ClockIcon, 
  FireIcon, 
  SparklesIcon, 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  CheckCircleIcon,
  UserGroupIcon,
  SignalIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface RecipesViewProps {
  inventory: FoodItem[];
  userProfile: UserProfile;
}

const RecipesView: React.FC<RecipesViewProps> = ({ inventory, userProfile }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeImages, setRecipeImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('expronix_favorite_recipes');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('expronix_favorite_recipes', JSON.stringify(Array.from(favoriteIds)));
  }, [favoriteIds]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const fetchRecipes = async () => {
    if (inventory.length === 0) return;
    setLoading(true);
    setRecipeImages({});
    const suggestions = await getRecipeSuggestions(inventory, userProfile);
    setRecipes(suggestions);
    setLoading(false);
    
    suggestions.forEach(recipe => {
      handleGenerateImage(recipe.id, recipe.image || recipe.title);
    });
  };

  const handleGenerateImage = async (recipeId: string, searchTerm: string) => {
    if (generatingImages[recipeId]) return;
    
    setGeneratingImages(prev => ({ ...prev, [recipeId]: true }));
    try {
      const url = await generateFoodImage(searchTerm);
      if (url) {
        setRecipeImages(prev => ({ ...prev, [recipeId]: url }));
      }
    } catch (error) {
      console.error("Failed to generate recipe image:", error);
    } finally {
      setGeneratingImages(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [userProfile.allergies, inventory.length]); 

  const urgentItemsCount = inventory.filter(i => i.status === 'Expiring Soon').length;

  const processedSelectedRecipe = useMemo(() => {
    if (!selectedRecipe) return null;

    const ingredientsWithStock = selectedRecipe.ingredients.map(ing => {
      const inventoryMatch = inventory.find(i => 
        i.name.toLowerCase().includes(ing.name.toLowerCase()) ||
        ing.name.toLowerCase().includes(i.name.toLowerCase())
      );

      return {
        ...ing,
        inStock: !!inventoryMatch,
        expiryDate: inventoryMatch?.expiryDate.split('T')[0]
      };
    });

    return {
      ...selectedRecipe,
      ingredients: ingredientsWithStock
    };
  }, [selectedRecipe, inventory]);

  const toggleIngredient = (name: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  if (selectedRecipe && processedSelectedRecipe) {
    const recipe = processedSelectedRecipe;
    const isFavorite = favoriteIds.has(recipe.id);

    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto scrollbar-hide">
        <div className="relative h-[40vh] w-full shrink-0">
          <img 
            src={recipeImages[recipe.id] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
            className="w-full h-full object-cover" 
            alt={recipe.title} 
          />
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
            <button 
              onClick={() => setSelectedRecipe(null)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg border border-white/20 active:scale-90 transition-all"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg border border-white/20 active:scale-90 transition-all">
                <ShareIcon className="w-6 h-6" />
              </button>
              <button 
                onClick={(e) => toggleFavorite(e, recipe.id)}
                className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg border border-white/20 active:scale-90 transition-all"
              >
                {isFavorite ? (
                  <HeartIconSolid className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-center space-x-2">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center space-x-2 border border-white/50 shadow-md">
              <ClockIcon className="w-4 h-4 text-[#2ECC71]" />
              <span className="text-[11px] font-bold text-gray-500">{recipe.prepTime}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center space-x-2 border border-white/50 shadow-md">
              <UserGroupIcon className="w-4 h-4 text-[#2ECC71]" />
              <span className="text-[11px] font-bold text-gray-500">{recipe.servings}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center space-x-2 border border-white/50 shadow-md">
              <SignalIcon className="w-4 h-4 text-[#2ECC71]" />
              <span className="text-[11px] font-bold text-gray-500">{recipe.difficulty}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-[#FDFDFD] p-6 space-y-6 relative z-20">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{recipe.title}</h1>
            <div className="flex items-center space-x-1.5">
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-gray-800">{recipe.rating}</span>
              <span className="text-sm text-gray-400 font-medium">({recipe.reviewCount} reviews)</span>
            </div>
          </div>
          <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
            {recipe.description || "A healthy and delicious meal perfect for using up your expiring ingredients and keeping your kitchen waste-free."}
          </p>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Ingredients</h2>
            <div className="space-y-3">
              {recipe.ingredients.map((ing, idx) => {
                const isChecked = !!checkedIngredients[ing.name];
                return (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-start space-x-4 shadow-sm relative">
                    <div className="pt-1">
                      <button 
                        onClick={() => toggleIngredient(ing.name)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${isChecked ? 'bg-[#2ECC71] border-[#2ECC71] text-white' : 'border-gray-200'}`}
                      >
                        {isChecked && <CheckCircleIcon className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between pr-2">
                        <h4 className={`text-[15px] font-bold tracking-tight transition-all ${isChecked ? 'text-gray-300 line-through' : 'text-gray-800'}`}>
                          {ing.name}
                        </h4>
                        {ing.inStock && (
                          <div className="flex items-center space-x-1 px-2.5 py-0.5 bg-[#E8F8EF] rounded-full border border-[#2ECC71]/20">
                            <CheckCircleIcon className="w-3 h-3 text-[#2ECC71]" />
                            <span className="text-[9px] font-bold text-[#2ECC71] uppercase">In Stock</span>
                          </div>
                        )}
                      </div>
                      <p className={`text-[13px] font-medium mt-0.5 ${isChecked ? 'text-gray-200' : 'text-gray-400'}`}>
                        {ing.quantity}
                      </p>
                      {ing.expiryDate && !isChecked && (
                        <p className="text-[11px] text-gray-300 font-medium mt-1">Expires: {ing.expiryDate}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-6 pb-20">
            <button className="w-full bg-[#2ECC71] text-white py-4.5 rounded-3xl font-bold text-[16px] shadow-xl shadow-green-100 active:scale-[0.98] transition-all flex items-center justify-center space-x-3">
              <span>Start Cooking</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Chef Assistant Header - Updated to match screenshot */}
      <div className="bg-gradient-to-br from-[#2ECC71] to-[#2980B9] p-7 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-start">
          <div className="flex items-center space-x-2 mb-2 opacity-90">
            <SparklesIcon className="w-4 h-4" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">AI Chef Assistant</h2>
          </div>
          <h1 className="text-2xl font-black mb-6 leading-tight tracking-tight">Zero Waste<br/>Smart Recipes</h1>
          
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center space-x-2">
              <FireIcon className="w-3 h-3 text-orange-300" />
              <span className="text-[9px] font-black uppercase tracking-tight">{urgentItemsCount} URGENT ITEMS</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center space-x-2">
              <ShieldCheckIcon className="w-3 h-3 text-green-300" />
              <span className="text-[9px] font-black uppercase tracking-tight">{userProfile.allergies.length} SAFETY FILTERS</span>
            </div>
          </div>

          <button 
            onClick={fetchRecipes}
            disabled={loading || inventory.length === 0}
            className="bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full text-[10px] font-black text-white border border-white/20 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH RECOMMENDATIONS</span>
          </button>
        </div>
        
        {/* Background Decor */}
        <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-[80px]"></div>
        <div className="absolute -left-10 top-0 w-32 h-32 bg-white/5 rounded-full blur-[60px]"></div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1,2].map(i => (
            <div key={i} className="bg-gray-100/50 p-3 rounded-[2.5rem] border border-gray-100/50 shadow-sm flex flex-col space-y-3 animate-pulse">
               <div className="h-64 bg-white rounded-[2rem]"></div>
               <div className="px-4 pb-4 space-y-2">
                 <div className="h-6 w-3/4 bg-white rounded-lg"></div>
                 <div className="h-4 w-1/2 bg-white rounded-lg"></div>
               </div>
            </div>
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="space-y-8 pb-12">
          {recipes.map((recipe) => {
            const isFavorite = favoriteIds.has(recipe.id);
            return (
              <div 
                key={recipe.id} 
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-gray-100/50 p-3 rounded-[2.5rem] border border-transparent hover:border-gray-200 transition-all cursor-pointer active:scale-[0.98] group"
              >
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm relative">
                  <div className="h-64 bg-gray-50 relative">
                    {recipeImages[recipe.id] ? (
                      <img 
                        src={recipeImages[recipe.id]} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        alt={recipe.title} 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-3 p-8">
                        <div className="relative">
                          <div className="w-10 h-10 border-4 border-[#2ECC71]/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-[#2ECC71] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">AI Vision Rendering...</p>
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center space-x-2 border border-white/50">
                         <ShieldCheckIcon className="w-4 h-4 text-[#2ECC71]" />
                         <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">Safety Filter Active</span>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <button 
                        onClick={(e) => toggleFavorite(e, recipe.id)}
                        className="p-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-white/50 active:scale-90 transition-all"
                      >
                        {isFavorite ? (
                          <HeartIconSolid className="w-5 h-5 text-red-500" />
                        ) : (
                          <HeartIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                       <div className="bg-[#2980B9] px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20 shadow-lg">
                        {recipe.difficulty}
                       </div>
                       <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-gray-700 uppercase tracking-widest border border-white/20 shadow-lg flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {recipe.prepTime}
                       </div>
                    </div>
                  </div>

                  <div className="p-7">
                    <h3 className="text-xl font-black mb-3 leading-tight text-gray-800 tracking-tight">{recipe.title}</h3>
                    
                    {recipe.expiringIngredientsUsed.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {recipe.expiringIngredientsUsed.map((ing, idx) => (
                          <span key={idx} className="bg-orange-50 text-[#F39C12] px-3 py-1 rounded-xl text-[9px] font-black border border-orange-100 flex items-center">
                            <FireIcon className="w-3 h-3 mr-1" />
                            {ing.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-50 pt-5 mt-2">
                      <div className="flex items-center space-x-1">
                        <StarIconSolid className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-black text-gray-800">{recipe.rating}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[#2ECC71] font-black text-[11px] uppercase tracking-widest">
                        <span>Get Recipe</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200 p-8">
           <div className="bg-white w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <SparklesIcon className="w-10 h-10 text-gray-200" />
           </div>
           <h3 className="text-lg font-black text-gray-800 mb-2 uppercase tracking-tight">AI Kitchen Waiting</h3>
           <p className="text-gray-400 font-bold text-xs px-8 leading-relaxed uppercase tracking-wide">
            {inventory.length === 0 
              ? "Your inventory is empty. Add items to see what our AI Chef can cook!" 
              : "Analyzing your pantry for safe, zero-waste meal options..."}
           </p>
        </div>
      )}
    </div>
  );
};

export default RecipesView;
