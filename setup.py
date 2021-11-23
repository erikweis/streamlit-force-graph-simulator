import setuptools

setuptools.setup(
    name="streamlit-force-graph-simulator",
    version="0.0.1",
    author="Erik Weis",
    author_email="erik.weis@uvm.edu",
    description="Linking python with visualizing processes on and off networks.",
    long_description="readme.md",
    long_description_content_type="text/markdown",
    url="",
    packages=setuptools.find_packages(),
    include_package_data=True,
    classifiers=[],
    python_requires=">=3.6",
    install_requires=[
        # By definition, a Custom Component depends on Streamlit.
        # If your component has other Python dependencies, list
        # them here.
        "streamlit >= 0.63",
    ],
)
