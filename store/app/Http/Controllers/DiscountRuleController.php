<?php

namespace App\Http\Controllers;

use App\Models\DiscountRule;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;

class DiscountRuleController extends Controller
{
    use LogsActivity;

    public function index()
    {
        $rules = DiscountRule::orderBy('created_at', 'desc')->get();
        return response()->json($rules);
    }

    public function store(Request $request)
    {
        // Only admin can create discount rules
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'max_percentage' => 'nullable|integer|min:0|max:100',
            'usage_limit' => 'nullable|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'applicable_to' => 'nullable|array',
            'excluded_product_ids' => 'nullable|array',
            'requires_approval' => 'boolean',
        ]);

        $rule = DiscountRule::create($request->all());

        $this->logActivity(
            'created',
            'DiscountRule',
            $rule->id,
            "Created discount rule: {$rule->name}"
        );

        return response()->json($rule, 201);
    }

    public function update(Request $request, $id)
    {
        // Only admin can update discount rules
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rule = DiscountRule::findOrFail($id);

        $request->validate([
            'name' => 'string|max:255',
            'type' => 'in:percentage,fixed',
            'value' => 'numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'max_percentage' => 'nullable|integer|min:0|max:100',
            'usage_limit' => 'nullable|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'applicable_to' => 'nullable|array',
            'excluded_product_ids' => 'nullable|array',
            'requires_approval' => 'boolean',
        ]);

        $old = $rule->toArray();
        $rule->update($request->all());

        $this->logActivity(
            'updated',
            'DiscountRule',
            $rule->id,
            "Updated discount rule: {$rule->name}",
            $old,
            $rule->toArray()
        );

        return response()->json($rule);
    }

    public function destroy(Request $request, $id)
    {
        // Only admin can delete discount rules
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rule = DiscountRule::findOrFail($id);
        $name = $rule->name;
        $rule->delete();

        $this->logActivity(
            'deleted',
            'DiscountRule',
            $id,
            "Deleted discount rule: {$name}"
        );

        return response()->json(['message' => 'Discount rule deleted successfully']);
    }

    public function getActive()
    {
        $rules = DiscountRule::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_date')
                    ->orWhereDate('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', now());
            })
            ->get();

        return response()->json($rules);
    }
}
