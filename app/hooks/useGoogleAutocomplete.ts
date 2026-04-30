import IGoogleAddressSearchProps from "@/app/components/googleAddressSearch/interfaces/IGoogleAddressSearchProps";
import { AddressSource } from "@/app/components/googleAddressSearch/types/addressSource";
import useGoogleAddressSearchStyles from "@/app/components/googleAddressSearch/useGoogleAddressSearchStyles";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { ChangeEvent, FocusEvent, RefObject, useCallback, useEffect, useRef } from "react";


/* -------------------------------------------------------------------------- */
/*                               GOOGLE CONFIG                                */
/* -------------------------------------------------------------------------- */


/**
 * Initialize Google Maps JS API loader.
 * Ensure API key is exposed via public env variables.
 */
setOptions({
    key: process.env.GOOGLE_PLACES_API_KEY,
    v: "weekly",
});

/* -------------------------------------------------------------------------- */
/*                          SHADOW DOM STYLE PATCH                            */
/* -------------------------------------------------------------------------- */

let isShadowPatched = false;

/**
 * Ensures Google Places Web Component shadow DOM is patched once.
 * This allows overriding internal styles of `gmp-place-autocomplete`.
 */
function ensureShadowDomPatched() {
    if (typeof window === "undefined") return;
    if (isShadowPatched || window.__chiizuShadowPatched) return;

    const originalAttachShadow = Element.prototype.attachShadow;

    Element.prototype.attachShadow = function (this: Element, init: ShadowRootInit) {
        if (this.localName === "gmp-place-autocomplete") {
            const shadow = originalAttachShadow.call(this, { ...init, mode: "open" });

            const style = document.createElement("style");

            style.textContent = `
                .focus-ring { display: none !important; }
                .autocomplete-icon { display: none !important; }

                .clear-button {
                    transform: scale(0.65) !important;
                    transition: transform 0.2s ease, opacity 0.2s ease !important;
                }

                .clear-button svg {
                    fill: ${color.DarkGrey} !important;
                }

                .clear-button:hover {
                    opacity: 0.8 !important;
                    cursor: pointer !important;
                }

                /* Use a host selector to detect the error state from the parent */
                :host([data-error="true"]) .focus-ring {
                    border: 1px solid ${color.Red} !important; /* Your specific error red */
                    display: block !important;
                    opacity: 1 !important;
                }
            `;

            queueMicrotask(() => shadow.appendChild(style));
            return shadow;
        }

        return originalAttachShadow.call(this, init);
    };

    window.__chiizuShadowPatched = true;
    isShadowPatched = true;
}

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

/**
 * Props for useGoogleAutocomplete hook.
 */
interface IUsePlaceAutocompleteProps
    extends Pick<
        IGoogleAddressSearchProps,
        "value" | "onChange" | "onBlur" | "countryISO2LetterCode" | "name" | "hasError"
    > {
    containerRef: RefObject<HTMLDivElement | null>;
    onPlaceSelect: (place: google.maps.places.Place, source: AddressSource) => void;
    includedPrimaryTypes?: string[];
}

/**
 * Extended Places library type to include Web Component.
 */
type ExtendedPlacesLibrary = google.maps.PlacesLibrary & {
    PlaceAutocompleteElement: typeof google.maps.places.PlaceAutocompleteElement;
};

/* -------------------------------------------------------------------------- */
/*                             HOOK IMPLEMENTATION                            */
/* -------------------------------------------------------------------------- */

/**
 * React hook to integrate Google Places Autocomplete Web Component.
 *
 * Features:
 * - Google Places dropdown
 * - Browser autofill detection
 * - Controlled input sync
 * - Address resolution from autofill
 *
 * @param props Hook configuration
 * @returns Ref to the underlying autocomplete element
 */
const useGoogleAutocomplete = ({
    containerRef,
    onPlaceSelect,
    countryISO2LetterCode,
    includedPrimaryTypes = [],
    name,
    value,
    hasError,
    onChange,
    onBlur,
}: IUsePlaceAutocompleteProps) => {
    useGoogleAddressSearchStyles();

    const autocompleteElementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

    const valueRef = useRef(value);
    const onPlaceSelectRef = useRef(onPlaceSelect);
    const onInputRef = useRef(onChange);
    const onBlurRef = useRef(onBlur);

    /* -------------------- SYNC REFS -------------------- */

    useEffect(() => { valueRef.current = value; }, [value]);
    useEffect(() => { onPlaceSelectRef.current = onPlaceSelect; }, [onPlaceSelect]);
    useEffect(() => { onInputRef.current = onChange; }, [onChange]);
    useEffect(() => { onBlurRef.current = onBlur; }, [onBlur]);

    const typesKey = includedPrimaryTypes.join(",");

    /* -------------------- AUTOFILL RESOLUTION -------------------- */

    /**
     * Resolves browser autofill text into a Google Place object.
     */
    const resolveSelection = useCallback(async (text: string) => {
        if (!text) return;

        const { AutocompleteService, Place } = await google.maps.importLibrary("places");

        const service = new AutocompleteService();

        const { predictions } = await service.getPlacePredictions({
            input: text,
            componentRestrictions: countryISO2LetterCode
                ? { country: countryISO2LetterCode }
                : undefined,
        });

        if (predictions.length > 0 && predictions[0]?.place_id) {
            const place = new Place({ id: predictions[0].place_id });

            await place.fetchFields({
                fields: ["addressComponents", "formattedAddress", "displayName"],
            });

            onPlaceSelectRef.current(place, "autofill");
        }
    }, [countryISO2LetterCode]);

    /* -------------------- INIT AUTOCOMPLETE -------------------- */

    useEffect(() => {
        ensureShadowDomPatched();

        let isMounted = true;
        const controller = new AbortController();
        const { signal } = controller;

        const init = async () => {
            if (!containerRef?.current) return;

            try {
                const { PlaceAutocompleteElement } = await importLibrary("places") as ExtendedPlacesLibrary;

                if (!isMounted) return;

                const element = new PlaceAutocompleteElement({
                    includedRegionCodes: countryISO2LetterCode
                        ? [countryISO2LetterCode]
                        : [],
                    includedPrimaryTypes: typesKey ? typesKey.split(",") : [],
                });

                if (name) {
                    element.setAttribute("name", name);
                }

                /* -------- INPUT -------- */
                element.addEventListener("input", (e: InputEvent) => {
                    if (!onInputRef.current) return;

                    const target = e.target as HTMLInputElement;

                    // Detect browser autofill selection
                    if (e.inputType === "insertReplacementText") {
                        // 1. Resolve the address components based on the selected text
                        resolveSelection(target.value);

                        // 2. Blur the element to force the Google UI dropdown to close immediately
                        target.blur();

                        const timeout = 10;
                        // Optional: Re-focus after a tick if you want the user to keep typing
                        setTimeout(() => target.focus(), timeout);
                    }

                    onInputRef.current({
                        target: {
                            name: name || "",
                            value: target.value,
                        },
                    } as ChangeEvent<HTMLInputElement>, { value: target.value });
                }, { signal });

                /* -------- BLUR -------- */
                element.addEventListener("focusout", (e: globalThis.FocusEvent) => {
                    if (!onBlurRef.current) return;

                    const target = e.target as HTMLInputElement;

                    onBlurRef.current({
                        target: {
                            name: name || "",
                            value: target.value,
                        },
                    } as FocusEvent<HTMLInputElement>);
                }, { signal });

                /* -------- GOOGLE SELECT -------- */
                element.addEventListener("gmp-select", async (e: google.maps.places.PlacePredictionSelectEvent) => {
                    try {
                        if (!e.placePrediction) return;

                        const place = e.placePrediction.toPlace();

                        await place.fetchFields({
                            fields: [
                                "addressComponents",
                                "formattedAddress",
                                "displayName",
                            ],
                        });

                        onPlaceSelectRef.current(place, "google");
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error("Chiizu-Checkout: Failed to fetch place details.", error);
                    }
                }, { signal });

                containerRef.current.innerHTML = "";
                containerRef.current.appendChild(element);
                autocompleteElementRef.current = element;

                element.value = valueRef.current ?? "";
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("Google Web Component load failed:", err);
            }
        };

        init();

        return () => {
            isMounted = false;
            controller.abort();
            autocompleteElementRef.current?.remove();
        };
    }, [containerRef, countryISO2LetterCode, typesKey, name, resolveSelection]);

    /* -------------------- SYNC VALUE -------------------- */

    useEffect(() => {
        if (!autocompleteElementRef.current) return;

        const nextValue = value ?? "";

        if (autocompleteElementRef.current.value !== nextValue) {
            autocompleteElementRef.current.value = nextValue;
        }
    }, [value]);

    // Inside useGoogleAutocomplete hook
    useEffect(() => {
        if (autocompleteElementRef.current) {
            // hasError comes from props
            autocompleteElementRef.current.setAttribute("data-error", hasError ? "true" : "false");
        }
    }, [hasError]);

    return autocompleteElementRef;
};

export default useGoogleAutocomplete;
