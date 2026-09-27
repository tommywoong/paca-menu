import os
from PIL import Image

images_to_check = [
    '04a3d04f1b2dbda970de3cc243561108.jpg',
    '05940b5838075c36f20a1c039855c485.png',
    '0ed9724561aeefbf35f76b1414bc4841.png',
    '0f9038b9f802c2baac311e709d434250.png',
    '102c86df00754d05af27fb5b8066686f.jpg',
    '1652457453919f440e4caa53cfb9bee1.png',
    '27038508d536ffa83e14004da4e19ce7.jpg',
    '29618b41bcc6ca8e80a19db2ac3a3551.jpg',
    '3baaf20a42501ddf5663dec37e970455.jpg',
    '65b3e5693e25e243717e41490a969368.jpg',
    '6fd7ddbe7e6158b21c6018ada081deb0.png',
    '7aa0aa6ea64c00175e79af359e540766.png',
    '7c72855e73fd1abddbb2fc1124ea499e.jpg',
    '807bf00644c4244d0bfc53897a405b78.jpg',
    '8332b154df2281f414f7300151a0f7d6.jpg',
    '8ccdcdb3a2f18990e491a76889d7f24d.png',
    '9472811c8aab427038d9cde27319a778.jpg',
    '95a3f965fcef5f9f602253209333f764.jpg',
    '95fb552f4a3556f1db0e9adca62e0bba.png',
    '965b73ea0752daec7f5f792df2170603.jpg',
    'b714bf56c3fcceadb4fd418d77791b7a.png',
    'bef2bc8db15b048d4ddb0642960230df.jpg',
    'c243f99dc58032a0f023c28ba843eac2.png',
    'c2d4608440211aa525baf5236b84862f.png',
    'c65ebb4572a0c6ef6c59f973218bf66a.png',
    'cc57a37c570ad0fd0dbb48a0f2509fe4.png',
    'd0b8fb7dfac8e7eb36d4f9811401f1f7.png',
    'f274b47078300b7fafc2c2dc134b7c4d.jpg',
    'fc9cb3199d9718151b1bd5110631826c.png',
    'fe201c803b510fa267c93caf4d15dace.png'
]

print(f"Total to check: {len(images_to_check)}")
for f in images_to_check:
    p = os.path.join('assets/canva', f)
    if os.path.exists(p):
        with Image.open(p) as im:
            print(f"{f}: {im.size} {im.mode}")
