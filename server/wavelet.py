import cv2
import numpy as np
import pywt

def w2d(img, mode='haar', level=1):
    # Ensure image is grayscale if it's RGB
    if len(img.shape) == 3:  # Check if the image is RGB (3 channels)
        imArray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    else:
        imArray = img

    # Convert to float and normalize to range [0, 1]
    imArray = np.float32(imArray)
    imArray /= 255

    # Compute the wavelet decomposition coefficients
    coeffs = pywt.wavedec2(imArray, mode, level=level)

    # Modify coefficients: Set approximation coefficients (low-frequency) to zero
    coeffs_H = list(coeffs)
    coeffs_H[0] *= 0

    # Reconstruct the image from modified coefficients
    imArray_H = pywt.waverec2(coeffs_H, mode)

    # Scale back to [0, 255] range and clip to ensure valid pixel values
    imArray_H = np.clip(imArray_H * 255, 0, 255)
    imArray_H = np.uint8(imArray_H)

    return imArray_H
