#!/bin/bash
cd /home/kavia/workspace/code-generation/tic-tac-toe-interactive-game-8fb5af20/reactjs_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

