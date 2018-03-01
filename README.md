# HCV-NABS

## Description

HCV-NABS (**H**epatitis **C** **V**irus -- **N**eutralising **A**nti**B**odie**S**) is a 
linked dataset and set of analysis scripts for analysing the variation of HCV virus sequences
with respect to the known binding locations of neutralising antibodies.

HCV-NABS is an open source analysis resource which accompanies the article "Predicting the Effectiveness of Hepatitis C Virus Neutralizing Antibodies by Analysis of Public Sequence Data", Cowton et al. 2018, Manuscript submitted 
for publication.

HCV-NABS is based on GLUE, an open source, data-centric bioinformatics environment
specialised for the analysis of virus sequence data. HCV-GLUE is the GLUE project for analysing HCV sequence data generally, and HCV-NABS is an extension to HCV-GLUE.

## Installation

You can install HCV-NABS on computers running Windows, MacOSX or Linux. Note: if you simply want to run the HCV-NABS analysis described in the accompanying article, it is not strictly necessary to install certain of GLUE's runtime dependencies such as BLAST+, MAFFT and RAxML. However you should install these if you are interested in using GLUE for general HCV sequence analysis.
1. Install GLUE, based on the [GLUE installation instructions](http://tools.glue.cvr.ac.uk/#/installation). 
2. Once GLUE is installed and working, you should download Offline HCV-GLUE and load it in to GLUE. Follow the [Offline HCV-GLUE installation instructions](http://hcv.glue.cvr.ac.uk/#/aboutGlueProject). You should select the **ncbi_hcv_glue.tar.gz** project build.
3. Clone the HCV-NABS repository into your `gluetools/projects` directory.
4. Within the `gluetools/projects/HCV-NABS`, start GLUE and build the HCV-NABS extension by issuing the following command in GLUE:
```
Mode path: /
GLUE> run file hcvNabsExtension.glue
```
5. This should run to completion and produce the `OK` result.

## Usage

## Contributing

## Credits

## License

