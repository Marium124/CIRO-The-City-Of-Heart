"""
Embeds trace JSON data directly into explorer.html for file:// compatibility.
Supports both golden and false_alarm traces - creates empty arrays for missing files.
"""

import json
import re
import os


def main():
    print("Embedding traces into explorer.html...")
    golden_path = "antigravity_traces/sample_trace.json"
    false_alarm_path = "antigravity_traces/false_alarm_trace.json"
    html_path = "antigravity_traces/explorer.html"

    # Load traces, default to empty array if file doesn't exist
    if os.path.exists(golden_path):
        with open(golden_path, "r") as f:
            golden_traces = json.load(f)
    else:
        golden_traces = []

    if os.path.exists(false_alarm_path):
        with open(false_alarm_path, "r") as f:
            false_alarm_traces = json.load(f)
    else:
        false_alarm_traces = []

    golden_str = json.dumps(golden_traces, separators=(',', ':'))
    false_alarm_str = json.dumps(false_alarm_traces, separators=(',', ':'))

    with open(html_path, "r") as f:
        html = f.read()

    embedded_data = f"""  <script id="embedded-trace-data">
    const EMBEDDED_GOLDEN_TRACES = {golden_str};
    const EMBEDDED_FALSE_ALARM_TRACES = {false_alarm_str};
  </script>"""

    # Find script tag and replace it
    new_html = re.sub(
        r'<script id="embedded-trace-data">.*?</script>',
        embedded_data,
        html,
        flags=re.DOTALL
    )

    with open(html_path, "w") as f:
        f.write(new_html)

    print(f"  Golden trace events: {len(golden_traces)}")
    print(f"  False alarm trace events: {len(false_alarm_traces)}")
    print("Traces successfully embedded!")


if __name__ == "__main__":
    main()
