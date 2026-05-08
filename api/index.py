from flask import Flask, request, jsonify
from flask_cors import CORS           # FIX #1: import flask-cors
from py3dbp import Packer, Bin, Item

app = Flask(__name__)
CORS(app)                             # FIX #1: enable CORS for all routes


def apply_gravity(packed_boxes):
    # Sort all boxes from bottom to top based on their current Y coordinate
    packed_boxes.sort(key=lambda b: b['y'])

    for i, box in enumerate(packed_boxes):
        # Assume the box drops all the way to the floor (Y = 0)
        new_y = 0

        # Check all boxes that are currently below this one in the list
        for j in range(i):
            other_box = packed_boxes[j]

            # Check if the boxes overlap on the X and Z axes
            x_overlap = (box['x'] < other_box['x'] + other_box['width']) and \
                        (box['x'] + box['width'] > other_box['x'])
            z_overlap = (box['z'] < other_box['z'] + other_box['depth']) and \
                        (box['z'] + box['depth'] > other_box['z'])

            if x_overlap and z_overlap:
                # This box must sit on top of the other box
                top_of_other_box = other_box['y'] + other_box['height']
                if top_of_other_box > new_y:
                    new_y = top_of_other_box

        box['y'] = new_y

    return packed_boxes


@app.route('/api/simulate', methods=['POST'])
def simulate_packing():
    # 1. Get the data from React
    data = request.json
    num_small = int(data.get('small', 0))
    num_large = int(data.get('large', 0))

    # 2. Initialize the Packer
    packer = Packer()

    # 3. Define the Truck (Bin) — matches Three.js truck: width=6, height=4, depth=8
    truck_w, truck_h, truck_d = 6, 4, 8
    packer.add_bin(Bin('Truck', truck_w, truck_h, truck_d, 10000))

    # 4. Add the items based on user input
    item_id_counter = 1

    for _ in range(num_small):
        packer.add_item(Item(f'Small_Box_{item_id_counter}', 1, 1, 1, 10))
        item_id_counter += 1

    for _ in range(num_large):
        packer.add_item(Item(f'Large_Box_{item_id_counter}', 2, 2, 2, 50))
        item_id_counter += 1

    # 5. Run the packing algorithm
    packer.pack()

    # 6. Format the results for React Three Fiber
    packed_boxes = []

    for b in packer.bins:
        for item in b.items:
            color = '#00b4d8' if 'Small' in item.name else '#ff7b00'
            width, height, depth = item.get_dimension()
            x, y, z = item.position

            packed_boxes.append({
                "id": item.name,
                "width": float(width),
                "height": float(height),
                "depth": float(depth),
                "x": float(x),
                "y": float(y),
                "z": float(z),
                "color": color
            })

    # 7. Apply gravity fix
    grounded_boxes = apply_gravity(packed_boxes)

    # 8. Calculate utilization % — FIX #2: now returned to frontend
    truck_volume = truck_w * truck_h * truck_d
    packed_volume = sum(b['width'] * b['height'] * b['depth'] for b in grounded_boxes)
    utilization = round((packed_volume / truck_volume) * 100, 1) if truck_volume > 0 else 0

    return jsonify({
        "boxes": grounded_boxes,
        "utilization": utilization,
        "packed_count": len(grounded_boxes),
        "unplaced_count": len(packer.unfit_items)
    })


# FIX #3: app.run() so you can start Flask locally with: python api/index.py
if __name__ == '__main__':
    app.run(debug=True, port=5000)
