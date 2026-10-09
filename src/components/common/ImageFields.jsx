import { useEffect, useMemo, useState } from "react";

const MAX_IMAGES = 10;
const ACCEPTED = "image/jpeg,image/png,image/webp";
const MAX_SIZE = 5 * 1024 * 1024;

// Image section for property/apartment forms: shows saved images (with Remove)
// and lets the user pick new files, which the parent uploads on save.
const ImageFields = ({ existing = [], onRemoveExisting, files, onFilesChange }) => {
  const [warning, setWarning] = useState("");
  const [removingId, setRemovingId] = useState(null);

  // Object URLs for the selected files, released when the selection changes
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews]
  );

  const spaceLeft = MAX_IMAGES - existing.length;

  const pickFiles = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";

    const tooBig = picked.filter((file) => file.size > MAX_SIZE);
    const valid = picked.filter((file) => file.size <= MAX_SIZE);
    const next = [...files, ...valid].slice(0, Math.max(spaceLeft, 0));

    const messages = [];
    if (tooBig.length) messages.push(`${tooBig.length} file(s) over 5MB were skipped.`);
    if (files.length + valid.length > next.length) messages.push(`Up to ${MAX_IMAGES} images in total.`);
    setWarning(messages.join(" "));

    onFilesChange(next);
  };

  const removeExisting = async (imageId) => {
    if (!window.confirm("Remove this image?")) return;
    setRemovingId(imageId);
    try {
      await onRemoveExisting(imageId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="image-fields full">
      <span className="image-fields-label">Images</span>

      {(existing.length > 0 || files.length > 0) && (
        <div className="image-fields-grid">
          {existing.map((image) => (
            <div className="image-fields-item" key={image._id}>
              <img src={image.url} alt="" />
              <button
                type="button"
                className="image-fields-remove"
                onClick={() => removeExisting(image._id)}
                disabled={removingId === image._id}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}

          {files.map((file, index) => (
            <div className="image-fields-item image-fields-new" key={`${file.name}-${index}`}>
              {previews[index] && <img src={previews[index]} alt="" />}
              <button
                type="button"
                className="image-fields-remove"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                aria-label="Don't upload this image"
              >
                ×
              </button>
              <span className="image-fields-badge">New</span>
            </div>
          ))}
        </div>
      )}

      {spaceLeft - files.length > 0 ? (
        <label className="image-fields-picker">
          <input type="file" accept={ACCEPTED} multiple onChange={pickFiles} />
          <span>+ Add images</span>
          <small>JPG, PNG or WebP, up to 5MB each ({spaceLeft - files.length} more allowed)</small>
        </label>
      ) : (
        <small className="image-fields-hint">Maximum of {MAX_IMAGES} images reached.</small>
      )}

      {warning && <small className="image-fields-warning">{warning}</small>}
    </div>
  );
};

export default ImageFields;
