import urllib.request
import json
import time

def get_doc_count():
    try:
        url = "http://127.0.0.1:9201/patients/_count"
        res = urllib.request.urlopen(url)
        data = json.loads(res.read().decode())
        return data.get('count', 0)
    except Exception as e:
        print(f"Error getting doc count: {e}")
        return 0

def restore_refresh():
    try:
        url = "http://127.0.0.1:9201/patients/_settings"
        req = urllib.request.Request(
            url,
            data=json.dumps({"index": {"refresh_interval": "1s"}}).encode(),
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        urllib.request.urlopen(req)
        print("Successfully restored Elasticsearch refresh_interval to 1s!")
        return True
    except Exception as e:
        print(f"Error restoring refresh interval: {e}")
        return False

def main():
    print("Background restorer started...")
    last_count = -1
    consecutive_same = 0
    
    while True:
        time.sleep(15)
        current_count = get_doc_count()
        print(f"Current docs in ES: {current_count}")
        
        if current_count >= 767900:
            print("Indexing completed (> 99.9% of target reached). Restoring refresh interval...")
            restore_refresh()
            break
            
        if current_count == last_count and current_count > 0:
            consecutive_same += 1
            if consecutive_same >= 3:
                print("Document count has stabilized. Restoring refresh interval...")
                restore_refresh()
                break
        else:
            consecutive_same = 0
            
        last_count = current_count

if __name__ == "__main__":
    main()
