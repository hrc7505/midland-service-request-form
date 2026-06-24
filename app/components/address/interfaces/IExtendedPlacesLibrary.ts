import ISuggestionResult from "@/app/components/address/interfaces/ISuggestionResult";

/**
 * Extends the global Google Maps PlacesLibrary interface with the new
 * AutocompleteSuggestion API methods and expected response shapes.
 */
export default interface IExtendedPlacesLibrary extends Omit<google.maps.PlacesLibrary, "AutocompleteSuggestion"> {
    AutocompleteSuggestion: {
        fetchAutocompleteSuggestions: (request: {
            input: string;
            includedRegionCodes?: string[];
        }) => Promise<{ suggestions?: ISuggestionResult[] }>;
    };
}