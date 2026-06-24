/**
 * Defines the structure of a place prediction returned by the Places API.
 */
export default interface IPlacePrediction {
    placeId: string;
    text: { text: string };
    toPlace: () => google.maps.places.Place;
}