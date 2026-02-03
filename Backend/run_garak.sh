#!/bin/bash

# Configuration
export OLLAMA_HOST="http://localhost:11434"

# Run Garak Scan
# - target_type: ollama
# - target_name: deepseek-r1:8b (Target Bastion Model)
# - generations: 3
# - report_prefix: deriv_sentinel_scan
garak --target_type ollama \
      --target_name deepseek-r1:8b \
      --probes promptinject,dan,malwaregen,misleading \
      --seed 42 \
      --generations 3 \
      --report_prefix deriv_sentinel_scan \
      --report html

