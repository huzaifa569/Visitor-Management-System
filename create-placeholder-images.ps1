# Create placeholder images for the VMS application

# Create the public directory if it doesn't exist
New-Item -ItemType Directory -Path public -Force | Out-Null

# List of image files to create
$imageFiles = @(
    "login-image.jpg",
    "signup-image.jpg",
    "building.jpg",
    "reception.jpg",
    "img1.png",
    "img2.png",
    "tablet-checkin.jpg"
)

# Create empty files for each image
foreach ($file in $imageFiles) {
    $path = "public/$file"
    New-Item -ItemType File -Path $path -Force | Out-Null
    Write-Host "Created placeholder file: $path"
}

Write-Host "All placeholder images created successfully."
