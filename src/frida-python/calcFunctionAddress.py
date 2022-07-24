# this small script uses the address of a method (during runtime)
# and the base address of the main module (also during runtime) to calculate
# the static address of a function such that it can be observed in static
# analysis tools like e.g. Ghidra
# the script keeps running after calculating a memory address and keeps using 
# the given base address, so you can calculate multiple addresses per run
# without having to re-enter the base addr


# rt is the prefix that indicates this value should be aquired during runtime

rt_base = input("Enter the base address of the module during runtime: (e.g. 0x10023dff5)\n")
print("Base address saved for the duration of this execution")

base_addr = 0x100000000

# calculate how much the rt base differs from the static base (due to ASLR and PIE)
aslr_offset = hex(int(rt_base, 16) - base_addr)

while True:
    rt_addr = input("Enter the function's address during runtime: (e.g. 0x1002d10b6)\n")
    # subtract the calculated aslr offset from the rt function addr to find out the actual 
    # address in the binary
    func_addr = hex(int(rt_addr, 16) - int(aslr_offset, 16))

    print(f"The static address of the function is: {func_addr}")
    print()