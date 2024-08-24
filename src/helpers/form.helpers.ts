import {FormGroup} from "@angular/forms";

export const getAllFormErrors = (group: FormGroup): ValidationError[] => {
    let errors: ValidationError[] = [];
    for(const controlName of Object.keys(group.controls)) {
        const control = group.controls[controlName];
        if (control instanceof FormGroup) {
            errors.push(...getAllFormErrors(control));
            continue;
        }
        if (control.errors === null) {
            continue;
        }
        for(const errorKey of Object.keys(control.errors)) {
            const error = control.errors[errorKey];
            errors.push({
                errorKey: errorKey,
                controlName: controlName,
                errorValue: error,
            })
        }
    }
    return errors;
}

interface ValidationError {
    controlName: string;
    errorKey: string;
    errorValue: any;
}
