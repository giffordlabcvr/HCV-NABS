#!/bin/bash
gunzip -c sql_bin/hcv_nabs.sql.gz | /usr/local/mysql/bin/mysql -u gluetools --password=gluetools GLUE_TOOLS
