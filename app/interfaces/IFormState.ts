export enum CustomerType {
    Residential = '132190000',
    Builder = '132190001'
}

export default interface IFormState {
    // --- Step 1: Selection ---
    customerType: CustomerType;

    // --- Step 3: Requestor Information ---
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string; // Optional field
    city: string;
    province: string;
    postalCode: string;
    midlandRepName: string;

    // --- Step 3: Site Information (Optional for Residential) ---
    siteContact?: string;
    projectName?: string;
    /* siteAddress1?: string;
    siteAddress2?: string;
    siteCity?: string;
    siteProvince?: string;
    sitePostalCode?: string;
    cityAndProvince?: string; */
    unitNumber?: string;


    // --- Step 4: Product Information ---
    brand: string;
    modelNumber?: string;
    serialNumber?: string;
    deliveryDate?: string; // Stored as ISO string "YYYY-MM-DD"
    invoiceNumber?: string;
    problem: string;
    appliance?: string;

    // File Handling
    photos?: File[];

    additionalNotes?: string;
}