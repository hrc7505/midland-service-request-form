/* -------------------------------------------------------------------------- */
/*                              STATE PARSER                                  */
/* -------------------------------------------------------------------------- */

/**
 * Extracts state information from a Google Place object.
 *
 * Priority:
 * - administrative_area_level_1 (State)
 * - administrative_area_level_2 (District/County fallback)
 * - administrative_area_level_3 (Sub-region fallback)
 *
 * @param place Google Place object
 * @returns State name and ISO code
 */
const extractState = (place: google.maps.places.Place) => {
    const components = place.addressComponents ?? [];

    /**
     * Utility to find component by type
     */
    const getComponent = (type: string) =>
        components.find((c) => c.types?.includes(type));

    const primary =
        getComponent("administrative_area_level_1") ||
        getComponent("administrative_area_level_2") ||
        getComponent("administrative_area_level_3");

    if (!primary) {
        return {
            name: "",
            iso_2_letter_code: "",
        };
    }

    return {
        name: primary.longText ?? "",
        iso_2_letter_code: primary.shortText ?? "",
    };
};

export default extractState;
