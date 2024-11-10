import os
import shutil
import time

def create_test_files(test_numbers, test_dir):
    for test_id in test_numbers:
        if test_id == 1:  # Rapid file creation
            for i in range(10):
                content = os.urandom(1024 * 100)
                with open(os.path.join(test_dir, f"test_file_{i}.txt"), 'wb') as f:
                    f.write(content)
                time.sleep(0.2)
                
        elif test_id == 2:  # Suspicious extensions
            extensions = ['.encrypted', '.crypto', '.locked', '.wannacry']
            for ext in extensions:
                with open(os.path.join(test_dir, f"important{ext}"), 'w') as f:
                    f.write("Test content")
                time.sleep(0.5)
                
        elif test_id == 3:  # High entropy files
            for i in range(3):
                content = os.urandom(1024 * 1024)  # 1MB of random data
                with open(os.path.join(test_dir, f"entropy_{i}.dat"), 'wb') as f:
                    f.write(content)
                time.sleep(0.5)
                
        elif test_id == 4:  # Rapid modifications
            filepath = os.path.join(test_dir, "modified.txt")
            for i in range(5):
                with open(filepath, 'w') as f:
                    f.write(f"Modified content {i}")
                time.sleep(0.2)
                
        elif test_id == 5:  # File moves/renames
            source = os.path.join(test_dir, "source.txt")
            with open(source, 'w') as f:
                f.write("Test content")
            dest = os.path.join(test_dir, "renamed.encrypted")
            shutil.move(source, dest)

if __name__ == '__main__':
    test_dir = r'C:\Users\mhmmd\Downloads\ransome'
    os.makedirs(test_dir, exist_ok=True)
    
    print("\n=== Ransomware Detector Test Suite ===")
    print("\nAvailable tests:")
    print("1. Rapid file creation")
    print("2. Suspicious extensions")
    print("3. High entropy files")
    print("4. Rapid file modifications")
    print("5. File moves/renames")
    print("6. Run all tests")
    
    try:
        choice = input("\nEnter test number(s) to run (comma-separated, e.g., 1,3,5): ")
        test_numbers = [int(x.strip()) for x in choice.split(',')]
        
        if 6 in test_numbers:
            test_numbers = list(range(1, 6))
            
        create_test_files(test_numbers, test_dir)
        print("\nTests completed successfully!")
        
    except Exception as e:
        print(f"\nError running tests: {e}") 