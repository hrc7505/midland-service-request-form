/**
 * Represents an address suggestion item mapped for use in the UI dropdown.
 */
export default interface IAddressSuggestion {
    id: string;
    description: string;
    toPlace: () => google.maps.places.Place;
}