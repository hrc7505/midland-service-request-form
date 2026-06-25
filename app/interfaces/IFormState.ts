export enum CustomerType {
    Residential = "Individual",
    Builder = "Builder"
}

export enum UploadStatus {
    Pending = "pending",
    Uploading = "uploading",
    Success = "success",
    Error = "error",
    Deleting = "deleting",
}

export interface IProductFile {
    fileKey: string; // name-size-lastmodified
    fileId?: string; // GUID from backend
    fileName: string;
    contentType: string;
    status: UploadStatus;
    errorMsg?: string;
}

export interface IProduct {
    id: string; // important for React rendering
    unitNumber?: string;
    appliance?: string;
    brand: string;
    modelNumber?: string;
    serialNumber?: string;
    deliveryDate?: string;
    invoiceNumber?: string;
    problem: string;
    photos?: File[];
    additionalNotes?: string;
    uploadSessionId?: string;
    uploadedFiles?: IProductFile[];
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
    midlandAccount: string;

    // --- Step 3: Site Information (Optional for Residential) ---
    projectName: string;
    siteContact?: string;
    siteContactPhone?: string;
    siteContactEmail?: string;


    // --- Step 4: Product Information ---
    products: IProduct[];
}