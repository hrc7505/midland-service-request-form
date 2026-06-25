"use client";

import { useState, useCallback, useRef, useEffect, InputEvent } from "react";
import { Field, Input, Combobox, Option, SelectionEvents, OptionOnSelectData } from "@fluentui/react-components";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

import IAddressProps from "@/app/components/address/interfaces/IAddressProps";
import IAddressSuggestion from "@/app/components/address/interfaces/IAddressSuggestion";
import IExtendedPlacesLibrary from "@/app/components/address/interfaces/IExtendedPlacesLibrary";
import IPlacePrediction from "@/app/components/address/interfaces/IPlacePrediction";
import type IFormState from "@/app/interfaces/IFormState";

import useAddressStyles from "@/app/components/address/useAddressStyles";

if (typeof window !== "undefined" && !(window as Window & { __GOOGLE_MAPS_INITIALIZED?: boolean }).__GOOGLE_MAPS_INITIALIZED) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  } else {
    setOptions({
      key: apiKey,
      v: "weekly"
    });
    (window as Window & { __GOOGLE_MAPS_INITIALIZED?: boolean }).__GOOGLE_MAPS_INITIALIZED = true;
  }
}

type AddressFieldName = "address1" | "address2" | "city" | "province" | "postalCode";

/**
 * Fluent UI Address Form Component integrated with Google Maps Places Autocomplete API.
 *
 * @param {IAddressProps} props - The component properties.
 * @returns {JSX.Element} The rendered Address component.
 */
export default function Address({
  data,
  handleInputChange,
  onUpdate,
  validations,
  fieldNames
}: IAddressProps & {
  fieldNames?: Partial<Record<AddressFieldName, keyof IFormState>>
}) {
  const styles = useAddressStyles();

  const names: Record<AddressFieldName, keyof IFormState> = {
    address1: fieldNames?.address1 || "address1",
    address2: fieldNames?.address2 || "address2",
    city: fieldNames?.city || "city",
    province: fieldNames?.province || "province",
    postalCode: fieldNames?.postalCode || "postalCode",
  };

  const [query, setQuery] = useState((data[names.address1] as string) || "");
  const [suggestions, setSuggestions] = useState<IAddressSuggestion[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  /**
   * Fetches address suggestions from Google Places API.
   * Uses debouncing to minimize API billing and prevent race conditions.
   *
   * @param {string} value - The address search query.
   */
  const getSuggestions = useCallback((value: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        const library = await importLibrary("places") as unknown as IExtendedPlacesLibrary;
        const { AutocompleteSuggestion } = library;

        const searchInput = value.toLowerCase().includes("bc") || value.toLowerCase().includes("british columbia")
          ? value
          : `${value}, BC`;

        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: searchInput,
          includedRegionCodes: ["ca"]
        });

        const mappedSuggestions = (response.suggestions || [])
          .filter((s): s is { placePrediction: IPlacePrediction } => !!s.placePrediction)
          .filter((s) => s.placePrediction.text.text.includes(", BC") || s.placePrediction.text.text.includes(", British Columbia"))
          .map((s) => ({
            id: s.placePrediction.placeId,
            description: s.placePrediction.text.text,
            toPlace: () => s.placePrediction.toPlace()
          }));

        setSuggestions(mappedSuggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    }, 200); // 350ms debounce
  }, []);

  /**
   * Handles input changes to the search query.
   * Updates local state and triggers the debounced suggestion fetch.
   *
   * @param {InputEvent<HTMLInputElement>} ev - The input change event.
   */
  const handleInput = useCallback((ev: InputEvent<HTMLInputElement>) => {
    const val = ev.currentTarget.value;
    setQuery(val);
    getSuggestions(val);
    onUpdate(names.address1, val);
  }, [getSuggestions, onUpdate, names.address1]);

  /**
   * Handles selection of a suggestion from the dropdown.
   * Fetches granular address components and updates the parent form state.
   *
   * @param {SelectionEvents} e - Fluent UI selection event.
   * @param {OptionOnSelectData} d - Data payload containing the selected text.
   */
  const onSelect = useCallback(async (e: SelectionEvents, d: OptionOnSelectData) => {
    const selectedId = d.optionValue || "";
    const prediction = suggestions.find(s => s.id === selectedId);

    if (prediction) {
      const place = prediction.toPlace();
      try {
        await place.fetchFields({ fields: ["addressComponents"] });
      } catch (error) {
        console.error("Error fetching place fields:", error);
        return;
      }

      let address1 = "";
      let postalCode = "";
      let city = "";
      let province = "";

      // Use Google's canonical mapping logic
      place.addressComponents?.forEach(component => {
        const componentType = component.types[0];

        switch (componentType) {
          case "street_number":
            address1 = `${component.longText || ""} ${address1}`;
            break;
          case "route":
            address1 += component.shortText || "";
            break;
          case "postal_code":
            postalCode = `${component.longText || ""}${postalCode}`;
            break;
          case "postal_code_suffix":
            postalCode = `${postalCode}-${component.longText || ""}`;
            break;
          case "locality":
            city = component.longText || "";
            break;
          case "administrative_area_level_1":
            province = component.shortText || "";
            break;
        }
      });

      const newAddress1 = address1.trim();

      onUpdate(names.address1, newAddress1);
      onUpdate(names.city, city);
      onUpdate(names.province, province);
      onUpdate(names.postalCode, postalCode);

      setQuery(newAddress1);
      setSuggestions([]);
    }
  }, [suggestions, onUpdate, names.address1, names.city, names.province, names.postalCode]);

  return (
    <>
      <Field label="Address Line 1" required {...validations.address1.fieldProps}>
        <Combobox
          name={names.address1}
          placeholder="Enter address to search..."
          value={query}
          autoComplete="on"
          onInput={handleInput}
          onOptionSelect={onSelect}
          {...validations.address1.inputProps}
        >
          {suggestions.map((s) => (
            <Option key={s.id} value={s.id} text={s.description}>
              {s.description}
            </Option>
          ))}
        </Combobox>
      </Field>
      <Field label="Address Line 2">
        <Input name={names.address2} value={(data[names.address2] as string) || ""} onChange={handleInputChange} />
      </Field>

      <div className={styles.grid}>
        <Field label="City" required {...validations.city.fieldProps}>
          <Input name={names.city} value={(data[names.city] as string) || ""} onChange={handleInputChange} {...validations.city.inputProps} />
        </Field>
        <Field label="Province / State" required {...validations.province.fieldProps}>
          <Input name={names.province} value={(data[names.province] as string) || ""} onChange={handleInputChange} {...validations.province.inputProps} />
        </Field>
      </div>

      <Field label="Postal Code" required {...validations.postalCode.fieldProps}>
        <Input name={names.postalCode} value={(data[names.postalCode] as string) || ""} onChange={handleInputChange} {...validations.postalCode.inputProps} />
      </Field>
    </>
  );
}
