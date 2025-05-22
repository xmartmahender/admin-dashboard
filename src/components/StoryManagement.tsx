import React, { useState, useEffect } from "react";
import { 
  collection, addDoc, updateDoc, deleteDoc, getDocs, 
  doc, query, orderBy, Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../lib/firebase";

export type Story = {
  id?: string;
  title: string;
  link: string;
  ageGroup: string;
  coverUrl: string;
  description?: string; // Add description field
  content?: string; // Add content field for full story text
  category?: string[]; // Add category/genre tags
  illustrations?: string[]; // Add additional illustrations
  audioUrl?: string; // Add audio narration URL
  language?: string; // Add story language
  isCodeStory?: boolean;
  codeSnippet?: string;
  programmingLanguage?: string;
  disabled?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  translations?: {
    [language: string]: {
      title?: string;
      description?: string;
      content?: string;
    }
  };
}

export function StoryManagement() {
  // Basic story fields
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [ageGroup, setAgeGroup] = useState("0-3");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Additional fields for enhanced stories
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [language, setLanguage] = useState("English");
  
  // Audio narration
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  
  // Illustrations
  const [illustrations, setIllustrations] = useState<string[]>([]);
  const [illustrationFile, setIllustrationFile] = useState<File | null>(null);
  
  // Code story fields
  const [isCodeStory, setIsCodeStory] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [programmingLanguage, setProgrammingLanguage] = useState("javascript");
  
  // Disable story toggle
  const [disabled, setDisabled] = useState(false);
  
  // Translation fields
  const [translationMode, setTranslationMode] = useState(false);
  const [translationLanguage, setTranslationLanguage] = useState('Urdu');
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedDescription, setTranslatedDescription] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [translations, setTranslations] = useState<{
    [language: string]: {
      title?: string;
      description?: string;
      content?: string;
    }
  }>({});

  // Available categories
  const STORY_CATEGORIES = ["Adventure", "Fairy Tale", "Animal", "Moral", "Funny", "Educational"];

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const storiesData: Story[] = [];
      
      querySnapshot.forEach((doc) => {
        storiesData.push({ id: doc.id, ...doc.data() } as Story);
      });
      
      setStories(storiesData);
    } catch (error) {
      console.error("Failed to load stories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Handle cover image upload
      let coverUrl = "";
      
      if (uploadMethod === "file" && coverFile) {
        try {
          // Get a reference to your storage location with a simpler name
          const fileName = coverFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
          const storageRef = ref(storage, `covers/${fileName}`);
          
          // Upload the file
          await uploadBytes(storageRef, coverFile);
          
          // Get the download URL
          coverUrl = await getDownloadURL(storageRef);
        } catch (err) {
          console.error("Error uploading file:", err);
          coverUrl = "https://placehold.co/400x300/png?text=Story";
        }
      } else if (uploadMethod === "url" && coverUrlInput) {
        coverUrl = coverUrlInput;
      } else if (editingId) {
        const existingStory = stories.find(s => s.id === editingId);
        coverUrl = existingStory?.coverUrl || "https://placehold.co/400x300/png?text=Story";
      } else {
        coverUrl = "https://placehold.co/400x300/png?text=Story";
      }

      // Handle audio upload if provided
      let audioFileUrl = audioUrl;
      if (audioFile) {
        try {
          const audioRef = ref(storage, `audio/${Date.now()}_${audioFile.name}`);
          await uploadBytes(audioRef, audioFile);
          audioFileUrl = await getDownloadURL(audioRef);
        } catch (err) {
          console.error("Error uploading audio:", err);
        }
      }
      
      // Process additional illustrations
      let updatedIllustrations = [...illustrations];
      if (illustrationFile) {
        try {
          const illRef = ref(storage, `illustrations/${Date.now()}_${illustrationFile.name}`);
          await uploadBytes(illRef, illustrationFile);
          const illUrl = await getDownloadURL(illRef);
          updatedIllustrations.push(illUrl);
        } catch (err) {
          console.error("Error uploading illustration:", err);
        }
      }

      // Include translations in storyData
      const storyData: Partial<Story> = {
        title,
        link,
        ageGroup,
        coverUrl,
        description,
        content,
        category: categories,
        illustrations: updatedIllustrations,
        audioUrl: audioFileUrl,
        language,
        isCodeStory,
        disabled,
        translations: translations,
        updatedAt: Timestamp.now()
      };
      
      // Add code story properties if needed
      if (isCodeStory) {
        Object.assign(storyData, {
          codeSnippet,
          programmingLanguage
        });
      }
      
      // Save to Firestore
      if (editingId) {
        const storyRef = doc(db, "stories", editingId);
        await updateDoc(storyRef, storyData);
      } else {
        await addDoc(collection(db, "stories"), {
          ...storyData,
          createdAt: Timestamp.now()
        });
      }
      
      resetForm();
      loadStories();
    } catch (error) {
      console.error("Error saving story", error);
    }
  };

  const handleDelete = async (id: string, coverUrl: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      // Delete cover image from storage if it's our Firebase URL
      if (coverUrl && coverUrl.includes("firebasestorage")) {
        try {
          const imageRef = ref(storage, coverUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error("Error deleting cover image", err);
        }
      }
      
      // Delete story document
      await deleteDoc(doc(db, "stories", id));
      loadStories();
    } catch (error) {
      console.error("Error deleting story", error);
    }
  };

  const handleEdit = (story: Story) => {
    setEditingId(story.id ?? null);
    setTitle(story.title);
    setLink(story.link);
    setAgeGroup(story.ageGroup || "0-3");
    setIsCodeStory(story.isCodeStory || false);
    setCodeSnippet(story.codeSnippet || "");
    setProgrammingLanguage(story.programmingLanguage || "javascript");
    setDisabled(story.disabled || false);
    setDescription(story.description || "");
    setContent(story.content || "");
    setCategories(story.category || []);
    setLanguage(story.language || "English");
    setAudioUrl(story.audioUrl || "");
    setIllustrations(story.illustrations || []);
    
    // Handle cover image
    if (story.coverUrl && !story.coverUrl.includes("firebasestorage") && 
        !story.coverUrl.includes("placeholder")) {
      setCoverUrlInput(story.coverUrl);
      setUploadMethod("url");
    } else {
      setUploadMethod("file");
    }

    // When editing a story, load its existing translations
    if (story.translations) {
      setTranslations(story.translations);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setLink("");
    setAgeGroup("0-3");
    setCoverFile(null);
    setCoverUrlInput("");
    setUploadMethod("file");
    setIsCodeStory(false);
    setCodeSnippet("");
    setProgrammingLanguage("javascript");
    setDisabled(false);
    setDescription("");
    setContent("");
    setCategories([]);
    setNewCategory("");
    setLanguage("English");
    setAudioFile(null);
    setAudioUrl("");
    setIllustrationFile(null);
    setIllustrations([]);
    setTranslationMode(false);
    setTranslationLanguage('Urdu');
    setTranslatedTitle('');
    setTranslatedDescription('');
    setTranslatedContent('');
    setTranslations({});
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const removeIllustration = (url: string) => {
    setIllustrations(illustrations.filter(i => i !== url));
  };

  const saveTranslation = () => {
    if (!translationLanguage) return;
    
    // Update translations state with the current language translation
    setTranslations(prev => ({
      ...prev,
      [translationLanguage]: {
        title: translatedTitle,
        description: translatedDescription,
        content: translatedContent
      }
    }));
    
    // Clear form for next translation
    setTranslatedTitle('');
    setTranslatedDescription('');
    setTranslatedContent('');
    
    // Show success message
    alert(`Translation for ${translationLanguage} has been added. Save the story to update it.`);
  };

  return (
    <div className="w-full">
      <div className="bg-white p-4 shadow rounded mb-6">
        <h2 className="text-xl font-semibold mb-4">Stories</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Story Title"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Age Group</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="0-3">0-3 years</option>
                <option value="3-6">3-6 years</option>
                <option value="6-9">6-9 years</option>
                <option value="9-12">9-12 years</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block mb-2">Story Link</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Story Link"
              required
            />
          </div>
          
          {/* Short Description */}
          <div>
            <label className="block mb-2">Short Description (1-2 lines)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="A brief description of the story"
            />
          </div>
          
          {/* Language Selection */}
          <div>
            <label className="block mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu</option>
              <option value="Hindi">Hindi</option>
              <option value="Sindhi">Sindhi</option>
            </select>
          </div>
          
          {/* Cover Image */}
          <div>
            <label className="block mb-2">Cover Image</label>
            <div className="flex gap-4 mb-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  checked={uploadMethod === "file"}
                  onChange={() => setUploadMethod("file")}
                  className="mr-2"
                />
                Upload from Computer
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  checked={uploadMethod === "url"}
                  onChange={() => setUploadMethod("url")}
                  className="mr-2"
                />
                Use Image URL
              </label>
            </div>
            
            {uploadMethod === "file" ? (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setCoverFile(e.target.files[0])}
                className="w-full p-2 border rounded"
              />
            ) : (
              <input
                type="url"
                value={coverUrlInput}
                onChange={(e) => setCoverUrlInput(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter image URL"
              />
            )}
          </div>
          
          {/* Audio Narration */}
          <div>
            <label className="block mb-2">Audio Narration (optional)</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => e.target.files && setAudioFile(e.target.files[0])}
              className="w-full p-2 border rounded"
            />
            <div className="mt-2">
              <label className="block mb-2">Or provide an audio URL</label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="URL to audio file"
              />
            </div>
          </div>
          
          {/* Additional Illustrations */}
          <div>
            <label className="block mb-2">Additional Illustrations</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && setIllustrationFile(e.target.files[0])}
              className="w-full p-2 border rounded mb-2"
            />
            
            {illustrations.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium mb-2">Current Illustrations:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {illustrations.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Illustration ${index + 1}`}
                        className="h-20 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeIllustration(url)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Categories/Tags */}
          <div>
            <label className="block mb-2">Categories/Tags</label>
            <div className="flex gap-2 mb-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-grow p-2 border rounded"
              >
                <option value="">Select a category</option>
                {STORY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((cat, idx) => (
                <span 
                  key={idx}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="ml-1 text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          {/* Full Story Content */}
          <div>
            <label className="block mb-2">
              Story Content (optional - support for formatting: *emphasized text*, "dialogue", BOOM! for sound effects)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded"
              rows={8}
              placeholder="Enter the full story text here. Use *text* for emphasis, CAPITALS! for sound effects, and &quot;quotation marks&quot; for dialogue."
            ></textarea>
          </div>
          
          {/* Code Story Toggle */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isCodeStory}
                onChange={(e) => setIsCodeStory(e.target.checked)}
                className="w-4 h-4"
              />
              <span>This is a code story/tutorial</span>
            </label>
          </div>

          {/* Code Story Fields */}
          {isCodeStory && (
            <>
              <div>
                <label className="block mb-2">Programming Language</label>
                <select
                  value={programmingLanguage}
                  onChange={(e) => setProgrammingLanguage(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a language</option>
                  <option value="javascript">JavaScript</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="python">Python</option>
                  <option value="scratch">Scratch</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Code Snippet</label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full p-2 border rounded font-mono bg-gray-50"
                  rows={8}
                  placeholder="Enter your code snippet here"
                ></textarea>
              </div>
            </>
          )}
          
          {/* Disable Story Toggle */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-red-600 font-medium">Temporarily disable this story</span>
            </label>
            {disabled && (
              <p className="text-sm text-gray-500 mt-1">
                This story will not be visible to users but will remain in your library.
              </p>
            )}
          </div>
          
          {/* Translation Section */}
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Translations</h3>
              <button
                type="button"
                onClick={() => setTranslationMode(!translationMode)}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
              >
                {translationMode ? "Hide Translation Form" : "Add Translation"}
              </button>
            </div>
            
            {/* Existing translations display */}
            {Object.keys(translations).length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">Available Translations:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(translations).map(lang => (
                    <span 
                      key={lang}
                      className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Translation form */}
            {translationMode && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="mb-4">
                  <label className="block mb-2">Language</label>
                  <select
                    value={translationLanguage}
                    onChange={(e) => setTranslationLanguage(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Urdu">Urdu</option>
                    <option value="Sindhi">Sindhi</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Title in {translationLanguage}</label>
                  <input
                    type="text"
                    value={translatedTitle}
                    onChange={(e) => setTranslatedTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder={`Story title in ${translationLanguage}`}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Description in {translationLanguage}</label>
                  <input
                    type="text"
                    value={translatedDescription}
                    onChange={(e) => setTranslatedDescription(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder={`Description in ${translationLanguage}`}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Content in {translationLanguage}</label>
                  <textarea
                    value={translatedContent}
                    onChange={(e) => setTranslatedContent(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={8}
                    placeholder={`Story content in ${translationLanguage}`}
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={saveTranslation}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                  >
                    Add {translationLanguage} Translation
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded font-bold"
            >
              {editingId ? "Update Story" : "Add Story"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Story List */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Manage Stories</h3>
          {loading ? (
            <p>Loading stories...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stories.map((story) => (
                <div 
                  key={story.id} 
                  className={`border rounded overflow-hidden shadow-sm ${story.disabled ? 'opacity-60' : ''}`}
                >
                  <div className="h-40 overflow-hidden relative">
                    {story.isCodeStory && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs rounded-bl">
                        Code Tutorial
                      </div>
                    )}
                    {story.disabled && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs rounded-br">
                        Disabled
                      </div>
                    )}
                    <img 
                      src={story.coverUrl || "https://placehold.co/400x300/eee/999?text=Story+Cover"} 
                      alt={story.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400x300/eee/999?text=Image+Error";
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="mb-2">
                      <a 
                        href={story.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {story.title}
                      </a>
                      <div className="text-sm text-gray-600">
                        <span>Age: {story.ageGroup || "Not specified"}</span>
                        {story.language && story.language !== "English" && (
                          <span className="ml-2 bg-purple-100 text-purple-800 px-1 rounded text-xs">
                            {story.language}
                          </span>
                        )}
                        {story.isCodeStory && (
                          <span className="ml-2 bg-gray-100 text-gray-800 px-1 rounded text-xs">
                            {story.programmingLanguage}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(story)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded flex-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => story.id && handleDelete(story.id, story.coverUrl || "")}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded flex-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}