// Since we're using system fonts for a more native feel,
// we don't need to load custom fonts
export const useFonts = () => {
  return { fontsLoaded: true, fontError: null };
};

export default useFonts;
