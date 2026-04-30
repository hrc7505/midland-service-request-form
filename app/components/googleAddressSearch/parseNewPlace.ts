/* -------------------------------------------------------------------------- */
/*                              ADDRESS PARSER                                */
/* -------------------------------------------------------------------------- */

import type { IAddressModel } from "@chiizu/checkout-core";

/**
 * Parses a Google Place object into internal address model.
 *
 * Handles:
 * - Street number + name
 * - Unit / subpremise
 * - City fallbacks (locality, postal_town, sublocality)
 * - State + ISO code
 * - Postal code
 *
 * @param place Google Place object
 * @returns Parsed address + completeness flag
 */
const parseNewPlace = (place: google.maps.places.Place) => {
    const fields: Omit<IAddressModel, "country"> = {
        line1: "",
        street_number: "",
        street_name: "",
        unit_number: "",
        city: "",
        zip_code: "",
        state: {
            name: "",
            iso_2_letter_code: "",
        },
    };

    const components = place.addressComponents ?? [];

    for (const component of components) {
        const types = component.types ?? [];
        const long = component.longText ?? "";
        const short = component.shortText ?? "";

        if (types.includes("street_number")) fields.street_number = long;
        if (types.includes("route")) fields.street_name = long;
        if (types.includes("subpremise")) fields.unit_number = long;

        if (types.includes("locality")) fields.city = long;

        if (types.includes("administrative_area_level_1")) {
            fields.state.name = long;
            fields.state.iso_2_letter_code = short;
        }

        if (types.includes("postal_code")) fields.zip_code = long;

        /* -------- FALLBACKS -------- */
        if (!fields.city && types.includes("postal_town")) fields.city = long;

        if (
            !fields.city &&
            (types.includes("sublocality") || types.includes("neighborhood"))
        ) {
            fields.city = long;
        }

        if (!fields.street_name && types.includes("premise")) {
            fields.street_name = long;
        }
    }

    /* -------- LINE1 BUILD -------- */
    if (fields.street_number || fields.street_name) {
        fields.line1 = `${fields.street_number} ${fields.street_name}`.trim();
    } else {
        fields.line1 =
            place.formattedAddress?.split(",")[0] ||
            place.displayName ||
            "";
    }

    /**
     * Defines whether address is sufficiently complete
     * for downstream usage (validation, submission, etc.)
     */
    const isCompleteAddress = Boolean(fields.street_name && fields.street_number && fields.city);

    return { address: fields, isCompleteAddress };
};

export default parseNewPlace;
