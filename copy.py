import os
import shutil
import subprocess

source_dir = r"c:\Vagish Dell Data\vagish\projects\Sukkus Birthday Surprise"
dest_dir = os.path.join(source_dir, "ReadyTemplate")

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

exclude_dirs = {"ReadyToHost", "site", "ReadyTemplate", ".git", "node_modules"}

def copytree_custom(src, dst):
    for item in os.listdir(src):
        if item in exclude_dirs:
            continue
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            if not os.path.exists(d):
                os.makedirs(d)
            copytree_custom(s, d)
        else:
            shutil.copy2(s, d)

print("Copying files...")
copytree_custom(source_dir, dest_dir)
print("Files copied.")

print("Initializing git...")
subprocess.run(["git", "init"], cwd=dest_dir, check=True)
subprocess.run(["git", "add", "."], cwd=dest_dir, check=True)
subprocess.run(["git", "commit", "-m", "Initial commit of cleaned and optimized template"], cwd=dest_dir, check=True)
print("Git initialized and committed.")
