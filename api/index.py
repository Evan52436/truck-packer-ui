from flask import Flask, request, jsonify
from py3dbp import Packer, Bin, Item

app = Flask(__name__)
# Enable CORS so your React app on port 5173 can make requests here 

def apply_gravity(packed_boxes):
    # 1. Sort all boxes from bottom to top based on their current Y coordinate
    packed_boxes.sort(key=lambda b: b['y'])

    for i, box in enumerate(packed_boxes):
        # Assume the box drops all the way to the floor (Y = 0)
        new_y = 0

        # Check all boxes that are currently below this one in the list
        for j in range(i):
            other_box = packed_boxes[j]

            # Check if the boxes overlap on the X and Z axes (meaning one is directly above the other)
            x_overlap = (box['x'] < other_box['x'] + other_box['width']) and \
                        (box['x'] + box['width'] > other_box['x'])
            z_overlap = (box['z'] < other_box['z'] + other_box['depth']) and \
                        (box['z'] + box['depth'] > other_box['z'])

            if x_overlap and z_overlap:
                # If they overlap, this box must sit on top of the other box
                top_of_other_box = other_box['y'] + other_box['height']
                if top_of_other_box > new_y:
                    new_y = top_of_other_box

        # Update the box's Y position to its new grounded resting place
        box['y'] = new_y

    return packed_boxes

@app.route('/simulate', methods=['POST'])
def simulate_packing():
    # 1. Get the data from React
    data = request.json
    num_small = int(data.get('small', 0))
    num_large = int(data.get('large', 0))

    # 2. Initialize the Packer
    packer = Packer()

    # 3. Define the Truck (Bin)
    # Dimensions match your Three.js truck: width=6, height=4, depth=8
    packer.add_bin(Bin('Truck', 6, 4, 8, 10000)) # 10000 is max weight (arbitrary for now)

    # 4. Add the items based on user input
    item_id_counter = 1
    
    # Add Small Boxes (Width:1, Height:1, Depth:1)
    for _ in range(num_small):
        packer.add_item(Item(f'Small_Box_{item_id_counter}', 1, 1, 1, 10)) # 10 is weight
        item_id_counter += 1
        
    # Add Large Boxes (Width:2, Height:2, Depth:2)
    for _ in range(num_large):
        packer.add_item(Item(f'Large_Box_{item_id_counter}', 2, 2, 2, 50))
        item_id_counter += 1

    # 5. Run the packing algorithm
    packer.pack()

    # 6. Format the results for React Three Fiber
    packed_boxes = []
    
    for b in packer.bins:
        for item in b.items:
            # Determine color based on item name
            color = '#00b4d8' if 'Small' in item.name else '#ff7b00'
            
            # The algorithm calculates position from the bottom-left corner (0,0,0)
            # It also calculates rotation, so we use item.get_dimension() which accounts for how it was rotated
            width, height, depth = item.get_dimension()
            x, y, z = item.position

# ... (previous code) ...
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

    # Apply our gravity fix before sending to React!
    grounded_boxes = apply_gravity(packed_boxes)

    # Send the JSON array back to React
    return jsonify(grounded_boxes)