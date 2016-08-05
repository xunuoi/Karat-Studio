#!/bin/bash

# install packages
npm install

# for image
yum install -y gcc php-devel php-pear
yum install -y ImageMagick ImageMagick-devel

# Install build dependencies
yum install -y gcc libpng libjpeg libpng-devel libjpeg-devel ghostscript libtiff libtiff-devel freetype freetype-devel

# Get GraphicsMagick source
wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/1.3/GraphicsMagick-1.3.9.tar.gz
tar zxvf GraphicsMagick-1.3.9.tar.gz

# Configure and compile
cd GraphicsMagick-1.3.9
./configure --enable-shared
make
make install

# Ensure everything was installed correctly
gm version

