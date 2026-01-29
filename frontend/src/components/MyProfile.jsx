import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyProfile = () => {
    const { loadUserProfileData, userData, token, backendUrl } = useContext(ShopContext);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', image: null });
    const [previewImage, setPreviewImage] = useState('');
    const [initialFormData, setInitialFormData] = useState({ name: '', email: '', image: '' });

    useEffect(() => {
        if (token) loadUserProfileData();
    }, [token]);

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                image: null,
            });
            setPreviewImage(userData.image || '');
            setInitialFormData({
                name: userData.name || '',
                email: userData.email || '',
                image: userData.image || '',
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isChanged =
            formData.name !== initialFormData.name ||
            formData.email !== initialFormData.email ||
            !!formData.image;

        if (!isChanged) {
            toast.info('No changes made');
            return;
        }

        const form = new FormData();
        form.append('name', formData.name);
        form.append('email', formData.email);
        if (formData.image) form.append('image', formData.image);

        try {
            const res = await axios.put(
                `${backendUrl}/api/user/update-profile`,
                form,
                { headers: { token } }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                setEditMode(false);
                loadUserProfileData();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Update failed');
        }
    };

    if (!userData) return <p className="text-center mt-20">Loading...</p>;

    return (
        <div className="flex flex-col gap-4 justify-center items-center mt-10">
            <h2 className="text-2xl md:text-4xl font-medium">
                Hello {userData.name} 👋
            </h2>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center gap-4 p-6 py-10 rounded-xl w-full max-w-md bg-gray-400 shadow"
            >
                {/* ✅ PROFILE IMAGE / FALLBACK */}
                {previewImage ? (
                    <img
                        src={previewImage}
                        alt="Profile"
                        className="w-28 h-28 object-cover rounded-full border"
                    />
                ) : (
                    <div className="w-28 h-28 rounded-full bg-gray-600 text-white flex items-center justify-center text-4xl font-semibold">
                        {userData.name?.charAt(0).toUpperCase()}
                    </div>
                )}

                {editMode && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full"
                    />
                )}

                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    disabled={!editMode}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-md ${editMode ? 'bg-white' : 'bg-gray-200'
                        }`}
                />

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={!editMode}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-md ${editMode ? 'bg-white' : 'bg-gray-200'
                        }`}
                />

                {!editMode ? (
                    <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md"
                    >
                        Update Profile
                    </button>
                ) : (
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-2 rounded-md"
                    >
                        Save
                    </button>
                )}
            </form>
        </div>
    );
};

export default MyProfile;

