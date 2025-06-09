import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/apiUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import FormField from '../components/FormField';
import SelectField from '../components/SelectField';
import { useEmployeeForm } from '../hooks/useEmployeeForm';

const EmployeeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formik, isEditing, isLoading, error, departments, handleFileChange, isSubmitting } =
    useEmployeeForm({ id });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Employee' : 'Add Employee'}
        </h2>
        {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <FormField
            label="Name"
            name="name"
            type="text"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name ? formik.errors.name : undefined}
            required={true}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email ? formik.errors.email : undefined}
            required={!isEditing}
            disabled={isEditing}
            readOnly={isEditing}
          />

          <FormField
            label="Phone"
            name="phone"
            type="tel"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone ? formik.errors.phone : undefined}
            required={true}
            pattern="^\+?[1-9]\d{1,14}$"
            title="Phone number must start with + followed by 1-15 digits"
          />

          <FormField
            label="Date of Birth"
            name="dob"
            type="date"
            value={formik.values.dob}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.dob ? formik.errors.dob : undefined}
            required={true}
          />

          <SelectField
            label="Department"
            name="department_id"
            value={formik.values.department_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.department_id ? formik.errors.department_id : undefined}
            required={true}
            options={[
              ...departments.map((dept) => ({
                value: dept.id.toString(),
                label: dept.name,
              })),
            ]}
          />

          <FormField
            label="Salary"
            name="salary"
            type="number"
            value={formik.values.salary}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.salary ? formik.errors.salary : undefined}
            required={true}
            min="0"
            step="0.01"
          />

          <SelectField
            label="Status"
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.status ? formik.errors.status : undefined}
            required={true}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
              Photo
            </label>
            {isEditing && formik.values.currentPhoto && (
              <div className="mt-2 mb-4">
                <img
                  src={getImageUrl(formik.values.currentPhoto) ?? ''}
                  alt={formik.values.name}
                  className="h-32 w-32 rounded-lg object-cover"
                />
              </div>
            )}
            <input
              type="file"
              name="photo"
              id="photo"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload a photo of the employee. Maximum file size: 5MB. Supported formats: JPG, PNG.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formik.isValid || !formik.dirty}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
