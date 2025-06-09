import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import FormField from '../components/FormField';
import SelectField from '../components/SelectField';
import { useDepartmentForm } from '../hooks/useDepartmentForm';

const DepartmentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formik, isEditing, isLoading, error, isSubmitting } = useDepartmentForm({ id });

  if (isEditing && isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Department' : 'Add Department'}
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
            error={formik.touched.name && formik.errors.name}
            required={true}
          />

          <SelectField
            label="Status"
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.status && formik.errors.status}
            required={true}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/departments')}
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

export default DepartmentForm;
