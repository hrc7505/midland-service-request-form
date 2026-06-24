import IPlacePrediction from "@/app/components/address/interfaces/IPlacePrediction";

/**
 * Defines the structure of an autocomplete suggestion result.
 */
export default interface ISuggestionResult {
    placePrediction?: IPlacePrediction;
}