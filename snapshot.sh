#!/bin/bash
/usr/local/mysql/bin/mysqldump -u gluetools --password=gluetools GLUE_TOOLS > sql_bin/hcv_nabs.sql
gzip sql_bin/hcv_nabs.sql
