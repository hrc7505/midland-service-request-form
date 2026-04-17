import { CustomerType } from "@/app/interfaces/IFormState";

export default interface IServiceModel {
    // --- Step 1: Selection & Metadata ---
    midland_intaketype: CustomerType;       // Choice
    midland_intakestatus?: number;     // Choice
    midland_source?: number;           // Choice (Image 3)
    midland_intakename?: string;       // Primary Name field

    // --- Step 2: Requestor Information ---
    midland_firstname: string;
    midland_lastname: string;
    midland_email: string;
    midland_phone: string;
    midland_serviceaddress: string;    // Text
    midland_city: string;
    midland_province: string;          // Choice
    midland_postalcode: string;
    midland_repname: string;           // Text (Image 3)

    // --- Step 3: Site Information (For Builders) ---
    midland_projectname?: string;
    midland_sitecontact?: string;
    midland_unitnumber?: string;

    // --- Step 4: Product Information ---
    midland_appliance?: string;        // Choice (Image 1)
    midland_brand: string;
    midland_modelnumber?: string;
    midland_serialnumber?: string;
    midland_deliverydate?: string;     // Date Only (YYYY-MM-DD)
    midland_invoicenumber?: string;
    midland_applianceproblem: string;  // Text Area
    midland_ReviewNotes?: string;      // Text Area (Image 3)
}